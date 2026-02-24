import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group, Stack, Title, Tooltip } from '@mantine/core';
import jsYaml from 'js-yaml';
import { useState } from 'react';
import Card from '@/elements/Card.tsx';
import Code from '@/elements/Code.tsx';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import HljsCode from '@/elements/HljsCode.tsx';
import NumberInput from '@/elements/input/NumberInput.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import { handleCopyToClipboard } from '@/lib/copy.ts';
import { useToast } from '@/providers/ToastProvider.tsx';

export default function AdminNodeConfiguration({ node }: { node: Node }) {
  const { addToast } = useToast();
  const [remote, setRemote] = useState(window.location.origin);
  const [apiPort, setApiPort] = useState(parseInt(new URL(node.url).port || '8080'));
  const [sftpPort, setSftpPort] = useState(node.sftpPort);

  const getNodeConfiguration = () => {
    let origin = window.location.origin;
    try {
      origin = new URL(remote).origin;
    } catch {
      // ignore
    }

    return {
      uuid: node.uuid,
      token_id: node.tokenId,
      token: node.token,
      api: {
        port: apiPort,
        disable_openapi_docs: true,
        upload_limit: 10240,
      },
      system: {
        sftp: {
          bind_port: sftpPort,
        },
      },
      allowed_mounts: [],
      remote: origin,
    };
  };

  const getCommand = () => {
    return `wings configure --join-data ${btoa(jsYaml.dump(getNodeConfiguration(), { condenseFlow: true, indent: 1, noArrayIndent: true }))}`;
  };

  return (
    <AdminSubContentContainer title='Node Configuration' titleOrder={2}>
      <div className='grid md:grid-cols-4 grid-cols-1 grid-rows-2 gap-4'>
        <div className='flex flex-col md:col-span-3'>
          <HljsCode
            languageName='yaml'
            language={() => import('highlight.js/lib/languages/yaml').then((mod) => mod.default)}
          >
            {jsYaml.dump(getNodeConfiguration())}
          </HljsCode>

          <div className='mt-2'>
            <p>
              Place this into the configuration file at <Code>/etc/pterodactyl/config.yml</Code> or run
            </p>
            <Group gap='xs' align='flex-start' wrap='nowrap' className='mt-2'>
              <Code block className='flex-1'>
                {getCommand()}
              </Code>
              <Tooltip label='Copy command'>
                <ActionIcon variant='subtle' onClick={handleCopyToClipboard(getCommand(), addToast)} size='lg'>
                  <FontAwesomeIcon icon={faCopy} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </div>
        </div>
        <Card>
          <Title className='text-right'>Configuration</Title>

          <Stack>
            <TextInput name='remote' label='Panel URL' value={remote} onChange={(e) => setRemote(e.target.value)} />
            <NumberInput
              name='api_port'
              label='API Port'
              value={apiPort}
              min={1}
              max={65535}
              onChange={(value) => setApiPort(Number(value))}
            />
            <NumberInput
              name='sftp_port'
              label='SFTP Port'
              value={sftpPort}
              min={1}
              max={65535}
              onChange={(value) => setSftpPort(Number(value))}
            />
          </Stack>
        </Card>
      </div>
    </AdminSubContentContainer>
  );
}
