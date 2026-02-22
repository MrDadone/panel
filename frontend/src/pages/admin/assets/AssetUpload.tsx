import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Text } from '@mantine/core';
import { ChangeEvent, useRef, useState } from 'react';
import uploadAssets from '@/api/admin/assets/uploadAssets.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Button from '@/elements/Button.tsx';
import RingProgress from '@/elements/RingProgress.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';

export default function AssetUpload({ invalidateAssets }: { invalidateAssets: () => void }) {
  const { addToast } = useToast();

  const [progress, setProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    setProgress(0);
    const files = event.target.files;
    if (!files?.length) return;

    const form = new FormData();
    for (const file of files) {
      form.append(file.name, file);
    }

    event.target.value = '';

    uploadAssets(form, {
      onUploadProgress: (progressEvent) => {
        setProgress(progressEvent.progress ? progressEvent.progress * 100 : 0);
      },
    })
      .then((assets) => {
        invalidateAssets();
        addToast(`${assets.length} Asset${assets.length === 1 ? '' : 's'} uploaded.`, 'success');
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setTimeout(() => setProgress(null), 100));
  };

  return (
    <>
      {progress ? (
        <RingProgress
          size={50}
          sections={[
            {
              value: progress,
              color: 'green',
            },
          ]}
          roundCaps
          thickness={4}
          label={
            <Text c='green' fw={700} ta='center' size='xs'>
              {progress.toFixed(0)}%
            </Text>
          }
        />
      ) : null}
      <Button
        onClick={() => fileInputRef.current?.click()}
        color='blue'
        leftSection={<FontAwesomeIcon icon={faPlus} />}
      >
        Upload
      </Button>

      <input type='file' ref={fileInputRef} className='hidden' onChange={handleFileUpload} multiple />
    </>
  );
}
