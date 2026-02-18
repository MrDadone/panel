import { Popover } from "@mantine/core";
import Button from "@/elements/Button.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import Checkbox from "@/elements/input/Checkbox.tsx";
import { useEffect } from "react";
import { useFileManager } from "@/providers/FileManagerProvider.tsx";

export default function FileSettings() {
  const { doClickOnce } = useFileManager();

  useEffect(() => {
    localStorage.setItem("file_click_once", String(doClickOnce.current));
  }, [doClickOnce.current]);

  return (
    <Popover position="bottom" withArrow shadow="md">
      <Popover.Target>
        <Button variant="transparent" size="compact-xs">
          <FontAwesomeIcon size="lg" icon={faCog} />
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Checkbox
          label={"Click once to open file or folder"}
          checked={doClickOnce.current}
          onChange={(e) => doClickOnce.current = e.target.checked}
        />
      </Popover.Dropdown>
    </Popover>
  );
}
