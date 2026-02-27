import { Group, Title } from '@mantine/core';
import { type OnMount } from '@monaco-editor/react';
import { join } from 'pathe';
import { startTransition, useEffect, useRef, useState } from 'react';
import { createSearchParams, useNavigate, useParams, useSearchParams } from 'react-router';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import getFileContent from '@/api/server/files/getFileContent.ts';
import saveFileContent from '@/api/server/files/saveFileContent.ts';
import Button from '@/elements/Button.tsx';
import { ServerCan } from '@/elements/Can.tsx';
import Code from '@/elements/Code.tsx';
import ServerContentContainer from '@/elements/containers/ServerContentContainer.tsx';
import MonacoEditor from '@/elements/MonacoEditor.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import Spinner from '@/elements/Spinner.tsx';
import { registerHoconLanguage, registerTomlLanguage } from '@/lib/monaco.ts';
import NotFound from '@/pages/NotFound.tsx';
import { useBlocker } from '@/plugins/useBlocker.ts';
import { FileManagerProvider, useFileManager } from '@/providers/FileManagerProvider.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';
import FileBreadcrumbs from './FileBreadcrumbs.tsx';
import FileEditorSettings from './FileEditorSettings.tsx';
import FileImageViewerSettings from './FileImageViewerSettings.tsx';
import FileNameModal from './modals/FileNameModal.tsx';

function FileEditorComponent() {
  const params = useParams<'action'>();

  const [searchParams, _] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const server = useServerStore((state) => state.server);
  const { editorMinimap, imageViewerSmoothing, browsingWritableDirectory, browsingDirectory, setBrowsingDirectory } =
    useFileManager();

  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [content, setContent] = useState('');

  const editorRef = useRef<Parameters<OnMount>[0]>(null);
  const contentRef = useRef(content);

  const blocker = useBlocker(dirty);

  useEffect(() => {
    setBrowsingDirectory(searchParams.get('directory') || '/');
    setFileName(searchParams.get('file') || '');
  }, [searchParams]);

  useEffect(() => {
    if (!browsingDirectory || !fileName) return;
    if (params.action === 'new') return;

    setLoading(true);
    getFileContent(server.uuid, join(browsingDirectory, fileName))
      .then((content) => (params.action === 'image' ? URL.createObjectURL(content) : content.text()))
      .then((content) => {
        startTransition(() => {
          setContent(content);
          setLoading(false);
        });
      });
  }, [fileName]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const saveFile = (name?: string) => {
    setDirty(false);

    if (!editorRef.current || !browsingWritableDirectory) return;

    const currentContent = editorRef.current.getValue();
    setSaving(true);

    saveFileContent(server.uuid, join(browsingDirectory, name ?? fileName), currentContent).then(() => {
      startTransition(() => {
        setSaving(false);
        setNameModalOpen(false);
      });

      addToast(`${name ?? fileName} was saved.`);

      if (name) {
        navigate(
          `/server/${server.uuidShort}/files/edit?${createSearchParams({
            directory: browsingDirectory,
            file: name,
          })}`,
        );
      }
    });
  };

  if (!['new', 'edit', 'image'].includes(params.action!)) {
    return <NotFound />;
  }

  const title = fileName ? (params.action === 'image' ? `Viewing ${fileName}` : `Editing ${fileName}`) : 'New File';

  return (
    <ServerContentContainer hideTitleComponent fullscreen title={title}>
      <div className='flex justify-between items-center lg:p-4 lg:pb-0 mx-5'>
        <Group>
          <Title>{title}</Title>

          {params.action === 'new' || params.action === 'edit' ? (
            <FileEditorSettings />
          ) : params.action === 'image' ? (
            <FileImageViewerSettings />
          ) : null}
        </Group>
        <div hidden={!browsingWritableDirectory || params.action === 'image'}>
          {params.action === 'edit' ? (
            <ServerCan action='files.update'>
              <Button loading={saving} onClick={() => saveFile()}>
                Save
              </Button>
            </ServerCan>
          ) : (
            <ServerCan action='files.create'>
              <Button loading={saving} onClick={() => setNameModalOpen(true)}>
                Create
              </Button>
            </ServerCan>
          )}
        </div>
      </div>

      <ConfirmationModal
        title='Unsaved Changes'
        opened={blocker.state === 'blocked'}
        onClose={() => blocker.reset()}
        onConfirmed={() => blocker.proceed()}
        confirm='Leave'
      >
        Are you sure you want to leave this page? You have unsaved changes in <Code>{fileName}</Code>.
      </ConfirmationModal>

      {loading ? (
        <div className='w-full h-screen flex items-center justify-center'>
          <Spinner size={75} />
        </div>
      ) : (
        <div className='flex flex-col relative'>
          <FileNameModal
            onFileName={(name: string) => saveFile(name)}
            opened={nameModalOpen}
            onClose={() => setNameModalOpen(false)}
          />

          <div className='flex justify-between w-full py-4'>
            <FileBreadcrumbs inFileEditor path={join(decodeURIComponent(browsingDirectory), fileName)} />
          </div>
          <div className='relative'>
            <div className='flex h-[calc(100vh-185px)] lg:h-[calc(100vh-119px)] max-w-full w-full z-1 absolute'>
              {params.action === 'image' ? (
                <div className='h-full w-full flex flex-row justify-center'>
                  <TransformWrapper minScale={0.5}>
                    <TransformComponent wrapperClass='w-[calc(100%-4rem)]! h-7/8! rounded-md'>
                      <img
                        src={content}
                        alt={fileName}
                        style={{ imageRendering: imageViewerSmoothing ? undefined : 'pixelated' }}
                      />
                    </TransformComponent>
                  </TransformWrapper>
                </div>
              ) : (
                <MonacoEditor
                  height='100%'
                  width='100%'
                  theme='vs-dark'
                  defaultValue={content}
                  path={fileName}
                  options={{
                    readOnly: !browsingWritableDirectory,
                    stickyScroll: { enabled: false },
                    minimap: { enabled: editorMinimap },
                    codeLens: false,
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    // @ts-expect-error this is valid
                    touchScrollEnabled: true,
                  }}
                  onChange={(value) => setContent(value || '')}
                  onMount={(editor, monaco) => {
                    editorRef.current = editor;
                    editor.onDidChangeModelContent(() => {
                      contentRef.current = editor.getValue();
                      setDirty(contentRef.current !== content);
                    });
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                      if (params.action === 'new') {
                        setNameModalOpen(true);
                      } else {
                        saveFile();
                      }
                    });
                    registerTomlLanguage(monaco);
                    registerHoconLanguage(monaco);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </ServerContentContainer>
  );
}

export default function FileEditor() {
  return (
    <FileManagerProvider>
      <FileEditorComponent />
    </FileManagerProvider>
  );
}
