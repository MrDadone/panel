import {
  faAdd,
  faBan,
  faCheckCircle,
  faCircle,
  faHardDrive,
  faInfoCircle,
  faMemory,
  faMicrochip,
  faMinus,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon } from '@mantine/core';
import { useState } from 'react';
import { NavLink } from 'react-router';
import Card from '@/elements/Card.tsx';
import CopyOnClick from '@/elements/CopyOnClick.tsx';
import Divider from '@/elements/Divider.tsx';
import Spinner from '@/elements/Spinner.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import { formatAllocation } from '@/lib/server.ts';
import { bytesToString, mbToBytes } from '@/lib/size.ts';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useGlobalStore } from '@/stores/global.ts';
import { useUserStore } from '@/stores/user.ts';
import ServerAddGroupModal from './modals/ServerAddGroupModal.tsx';

const statusToColor = (status: ServerPowerState | undefined) => {
  switch (status) {
    case 'running':
      return 'bg-green-500';
    case 'starting':
      return 'bg-yellow-500';
    case 'stopping':
      return 'bg-red-500';
    default:
      return 'bg-red-500';
  }
};

export default function ServerItem({
  server,
  showGroupAddButton = false,
  onGroupRemove,
  isSelected = false,
  onSelectionChange,
  onClick,
  showSelection = true,
  sKeyPressed = false,
}: {
  server: Server;
  showGroupAddButton?: boolean;
  onGroupRemove?: () => void;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  onClick?: (event: React.MouseEvent) => void;
  showSelection?: boolean;
  sKeyPressed?: boolean;
}) {
  const { t } = useTranslations();
  const { serverGroups, getServerResourceUsage } = useUserStore();
  const { serverListShowOthers } = useGlobalStore();

  const [openModal, setOpenModal] = useState<'add-group' | null>(null);
  const stats = getServerResourceUsage(server.uuid);

  const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : t('common.unlimited', {});
  const memoryLimit =
    server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : t('common.unlimited', {});
  const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : t('common.unlimited', {});

  return (
    <>
      <ServerAddGroupModal server={server} opened={openModal === 'add-group'} onClose={() => setOpenModal(null)} />

      <div>
          <div onClick={onClick}>
            <NavLink to={`/server/${server.uuidShort}`} onClick={(e) => {
              // Prevent navigation when S key is held
              if (sKeyPressed) {
                e.preventDefault();
              }
            }}>
          <Card
            className='duration-200 h-full flex flex-col justify-between rounded-sm!'
            leftStripeClassName={statusToColor(stats?.state)}
            hoverable
          >
            <div className='flex items-start gap-2 justify-between'>
              <span
                className='text-xl font-medium truncate flex my-auto gap-2 flex-row whitespace-break-spaces'
                title={server.name}
              >
                {server.name}
              {!serverListShowOthers && serverGroups.every((g) => !g.serverOrder.includes(server.uuid)) && (
                <Tooltip className='ml-2' label={t('pages.account.home.tooltip.noGroup', {})}>
                  <FontAwesomeIcon size='sm' icon={faInfoCircle} />
                </Tooltip>
              )}
            </span>
            <div className='flex flex-row items-center'>
              {server.allocation ? (
                server.egg.separatePort ? (
                  <div className='flex flex-row gap-2'>
                    <CopyOnClick content={server.allocation.ipAlias ?? server.allocation.ip} className='w-fit'>
                      <Card p='xs' hoverable>
                        <p className='text-sm text-gray-400'>{server.allocation.ipAlias ?? server.allocation.ip}</p>
                      </Card>
                    </CopyOnClick>
                    <CopyOnClick content={server.allocation.port.toString()} className='w-fit'>
                      <Card p='xs' hoverable>
                        <p className='text-sm text-gray-400'>{server.allocation.port.toString()}</p>
                      </Card>
                    </CopyOnClick>
                  </div>
                ) : (
                  <CopyOnClick content={formatAllocation(server.allocation)} className='w-fit'>
                    <Card p='xs' hoverable>
                      <p className='text-sm text-gray-400'>{formatAllocation(server.allocation)}</p>
                    </Card>
                  </CopyOnClick>
                )
              ) : (
                <Card p='xs' className='leading-[100%] text-nowrap'>
                  {t('common.server.noAllocation', {})}
                </Card>
              )}
              {showSelection && (
                <Tooltip
                  label={isSelected ? t('pages.account.home.bulkActions.deselect', {}) : t('pages.account.home.bulkActions.select', {})}
                  className='ml-2'
                >
                  <ActionIcon
                    size='input-sm'
                    variant={isSelected ? 'filled' : 'light'}
                    color={isSelected ? 'green' : 'gray'}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectionChange?.(!isSelected);
                    }}
                  >
                    <FontAwesomeIcon icon={isSelected ? faCheckCircle : faCircle} />
                  </ActionIcon>
                </Tooltip>
              )}
              {showGroupAddButton && (
                <Tooltip
                  label={
                    serverGroups.length === 0
                      ? t('pages.account.home.tooltip.noGroups', {})
                      : t('pages.account.home.tooltip.addToGroup', {})
                  }
                  className='ml-2'
                >
                  <ActionIcon
                    size='input-sm'
                    variant='light'
                    disabled={serverGroups.length === 0}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenModal('add-group');
                    }}
                  >
                    <FontAwesomeIcon icon={faAdd} />
                  </ActionIcon>
                </Tooltip>
              )}
              {onGroupRemove && (
                <Tooltip label={t('pages.account.home.tooltip.removeFromGroup', {})} className='ml-2'>
                  <ActionIcon
                    size='input-sm'
                    color='red'
                    variant='light'
                    onClick={(e) => {
                      e.preventDefault();
                      onGroupRemove();
                    }}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </ActionIcon>
                </Tooltip>
              )}
            </div>
          </div>

          <div className='flex flex-col justify-between gap-2'>
            <Divider my='md' />

            {server.suspended ? (
              <div className='col-span-3 flex flex-row items-center justify-center'>
                <FontAwesomeIcon size='1x' icon={faBan} color='red' />
                <p className='ml-2 text-sm'>{t('common.server.state.suspended', {})}</p>
              </div>
            ) : server.status === 'installing' ? (
              <div className='col-span-3 flex flex-row items-center justify-center'>
                <Spinner size={16} />
                <p className='ml-2 text-sm'>{t('common.server.state.installing', {})}</p>
              </div>
            ) : server.status === 'restoring_backup' ? (
              <div className='col-span-3 flex flex-row items-center justify-center'>
                <Spinner size={16} />
                <p className='ml-2 text-sm'>{t('common.server.state.restoringBackup', {})}</p>
              </div>
            ) : server.status === 'install_failed' ? (
              <div className='col-span-3 flex flex-row items-center justify-center'>
                <FontAwesomeIcon size='1x' icon={faTriangleExclamation} color='yellow' />
                <p className='ml-2 text-sm'>{t('common.server.state.InstallFailed', {})}</p>
              </div>
            ) : !stats ? (
              <div className='col-span-3 flex flex-row items-center justify-center'>
                <Spinner size={16} />
              </div>
            ) : (
              <div className='flex flex-row justify-center'>
                <div className='flex gap-2 text-sm justify-center items-center'>
                  <FontAwesomeIcon icon={faMicrochip} className='size-5 flex-none' />
                  <div>
                    <span className='mr-1'>{stats.cpuAbsolute.toFixed(2)}%</span>
                    <span className='inline-block text-xs text-gray-400'>/ {cpuLimit}</span>
                  </div>
                </div>

                <Divider mx='sm' orientation='vertical' />

                <div className='flex gap-2 text-sm justify-center items-center'>
                  <FontAwesomeIcon icon={faMemory} className='size-5 flex-none' />
                  <div>
                    <span className='mr-1'>{bytesToString(stats.memoryBytes)}</span>
                    <span className='inline-block text-xs text-gray-400'>/ {memoryLimit}</span>
                  </div>
                </div>

                <Divider mx='sm' orientation='vertical' />

                <div className='flex gap-2 text-sm justify-center items-center'>
                  <FontAwesomeIcon icon={faHardDrive} className='size-5 flex-none' />
                  <div>
                    <span className='mr-1'>{bytesToString(stats.diskBytes)}</span>
                    <span className='inline-block text-xs text-gray-400'>/ {diskLimit}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </NavLink>
        </div>
      </div>
    </>
  );
}
