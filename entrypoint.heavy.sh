#!/bin/ash

REPO_DIR="/app/repo"
cd "$REPO_DIR" || exit 1

touch /tmp/rebuild_trigger

export EXTENSION_LOG="/tmp/extension_build.log"
export EXTENSION_BUILD_LOCK="/tmp/extension_build.lock"

export RUSTFLAGS="-C target-cpu=native"

if [ ! -d "/usr/local/cargo/registry" ]; then
	echo "Error: /usr/local/cargo/registry directory is missing. Please mount the cargo registry volume."
	exit 1
fi

if [ ! -d "/usr/local/cargo/git" ]; then
	echo "Error: /usr/local/cargo/git directory is missing. Please mount the cargo git volume."
	exit 1
fi

if [ ! -d "/app/binaries" ]; then
	echo "Error: /app/binaries directory is missing. Please mount the binaries volume."
	exit 1
fi

if [ ! -d "/app/extensions" ]; then
	echo "Error: /app/extensions directory is missing. Please mount the extensions volume."
	exit 1
fi

if [ ! -d "/app/repo/target" ]; then
	echo "Error: /app/repo/target directory is missing. Please mount a volume for rust dependencies."
	exit 1
fi

if [ ! -d "/app/repo/database/node_modules" ]; then
	echo "Error: /app/repo/database/node_modules directory is missing. Please run 'pnpm install' in the database directory first."
	exit 1
fi

if [ ! -d "/app/repo/database/migrations-temp" ]; then
	echo "Error: /app/repo/database/migrations-temp directory is missing. Please mount a volume for database migrations."
	exit 1
fi

if [ ! -d "/app/repo/frontend/node_modules" ]; then
	echo "Error: /app/repo/frontend/node_modules directory is missing. Please run 'pnpm install' in the frontend directory first."
	exit 1
fi

cp -R /app/repo/database/migrations/* /app/repo/database/migrations-temp/

# calculate the combined sha256 hash of all arguments' contents
hash_many() {
	local hash=""
	for file in "$@"; do
		if [ -f "$file" ]; then
			file_hash=$(sha256sum "$file" | awk '{print $1}')
			hash="${hash}${file_hash}"
		fi
	done
	echo -n "$hash" | sha256sum | awk '{print $1}'
}

PANEL_PID=""

start_panel() {
	local bin="$1"
	echo "Starting panel-rs with binary: $bin"

	if [ -n "$PANEL_PID" ]; then
		echo "Stopping existing panel-rs with PID: $PANEL_PID"
		kill "$PANEL_PID"
		wait "$PANEL_PID"
		PANEL_PID=""
	fi

	"$bin" &
	PANEL_PID=$!
	echo "panel-rs started with PID: $PANEL_PID"
}

PANEL_VERSION=$(/usr/bin/panel-rs version)
PANEL_VERSION=$(echo $PANEL_VERSION | awk '{print $2}')

execute_build() {
	if [ -f "$EXTENSION_BUILD_LOCK" ]; then
		echo "Extension build already in progress. spin looping."
		while [ -f "$EXTENSION_BUILD_LOCK" ]; do
			sleep 1
		done
		echo "Extension build completed by another process."
	fi

	touch "$EXTENSION_BUILD_LOCK"

	local EXT_HASH=$(hash_many /app/extensions/*.c7s.zip)

	cp -R /app/repo/database/migrations-temp/* /app/repo/database/migrations/

	echo "Building new binary with current extensions..."
	# loop over all extension files
	for ext_file in /app/extensions/*.c7s.zip; do
		echo "Adding extension: $ext_file"
		/usr/bin/panel-rs extensions add "$ext_file" >> "$EXTENSION_LOG" 2>&1
	done

	local PROFILE="balanced"
	local PROFILE_PATH="heavy-release"

	# resync internal extension list
	/usr/bin/panel-rs extensions resync >> "$EXTENSION_LOG" 2>&1

	cp -R /app/repo/database/migrations/* /app/repo/database/migrations-temp/

	# apply changes
	export NODE_OPTIONS="--max-old-space-size=2048"
	/usr/bin/panel-rs extensions apply --skip-replace-binary --profile $PROFILE >> "$EXTENSION_LOG" 2>&1

	local EXIT_CODE=$?

	# check status of last command
	if [ $EXIT_CODE -eq 0 ]; then
		echo "Extension build successful. Saving new binary."
		echo 0 > /tmp/extension_build.exitcode

		# create directory for new binary
		mkdir -p "/app/binaries/$PANEL_VERSION/$EXT_HASH"
		# move new binary to binaries directory
		mv "/app/repo/target/$PROFILE_PATH/panel-rs" "$BINARY_PATH"

		# restart panel with new binary
		echo "Restarting panel-rs with new binary."
		start_panel "$BINARY_PATH"
	else
		echo "Extension build failed. Check the log at $EXTENSION_LOG for details."
		echo $EXIT_CODE > /tmp/extension_build.exitcode
	fi

	rm "$EXTENSION_BUILD_LOCK"
}

# get combined hash of all extension files
EXT_HASH=$(hash_many /app/extensions/*.c7s.zip)

# check if binary with this hash exists
BINARY_PATH="/app/binaries/$PANEL_VERSION/$EXT_HASH/panel-rs"
if [ -f "$BINARY_PATH" ]; then
	echo "Found existing binary for current extensions."
	start_panel "$BINARY_PATH"
else
	echo "No existing binary found for current extensions. Temporarily using default binary."
	start_panel "/usr/bin/panel-rs"

	# execute build if extensions directory is not empty
	if [ "$(ls -A /app/extensions)" ]; then
		execute_build
	else
		echo "No extensions found in /app/extensions. Skipping build."
	fi
fi

# watch for changes in /tmp/rebuild_trigger
inotifywait -m -e create,modify /tmp/rebuild_trigger | while read -r directory events filename; do
	echo "Rebuild trigger detected: $events on $filename"
	execute_build
done
