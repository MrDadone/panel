import { faFilePen } from '@fortawesome/free-solid-svg-icons';
import ContextMenu, { ContextMenuItem } from '@/elements/ContextMenu.tsx';
import { useServerCan } from '@/plugins/usePermissions.ts';

interface FileRowContextMenuProps {
  file: DirectoryEntry;
  children: (props: { items: ContextMenuItem[]; openMenu: (x: number, y: number) => void }) => React.ReactNode;
}

export default function FileRowContextMenu({ file, children }: FileRowContextMenuProps) {
  return (
    <ContextMenu
      items={[
        {
          icon: faFilePen,
          label: 'Rename',
          // hidden: !!browsingBackup || !browsingWritableDirectory,
          // onClick: () => setOpenModal('rename'),
          // canAccess: useServerCan('files.update'),
        },
      ]}
    >
      {children}
    </ContextMenu>
  );
}
