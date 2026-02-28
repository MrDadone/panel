import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Popover } from '@mantine/core';
import { useEffect } from 'react';
import Button from '@/elements/Button.tsx';
import Checkbox from '@/elements/input/Checkbox.tsx';
import { useFileManager } from '@/providers/FileManagerProvider.tsx';

export default function FileImageViewerSettings() {
  const { imageViewerSmoothing, setImageViewerSmoothing } = useFileManager();

  useEffect(() => {
    localStorage.setItem('file_image_viewer_smoothing', String(imageViewerSmoothing));
  }, [imageViewerSmoothing]);

  return (
    <Popover position='bottom' withArrow shadow='md'>
      <Popover.Target>
        <Button variant='transparent' size='compact-xs'>
          <FontAwesomeIcon size='lg' icon={faCog} />
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Checkbox
          label='Smoothen Image (Anti-Aliasing)'
          checked={imageViewerSmoothing}
          onChange={(e) => setImageViewerSmoothing(e.target.checked)}
        />
      </Popover.Dropdown>
    </Popover>
  );
}
