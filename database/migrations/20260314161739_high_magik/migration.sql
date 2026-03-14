CREATE TABLE "user_command_snippets" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_uuid" uuid NOT NULL,
	"name" varchar(124) NOT NULL,
	"eggs" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"command" text NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "command_snippets_user_uuid_idx" ON "user_command_snippets" ("user_uuid");
CREATE UNIQUE INDEX "command_snippets_user_uuid_name_idx" ON "user_command_snippets" ("user_uuid","name");
ALTER TABLE "user_command_snippets" ADD CONSTRAINT "user_command_snippets_user_uuid_users_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE;