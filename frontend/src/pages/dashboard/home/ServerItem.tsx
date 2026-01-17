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
  faNetworkWired,
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
      return 'bg-server-status-running';
    case 'starting':
      return 'bg-server-status-starting';
    case 'stopping':
      return 'bg-server-status-stopping';
    default:
      return 'bg-server-status-offline';
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

  const getStatusText = () => {
    if (server.suspended) {
      return { text: t('common.server.state.suspended', {}), color: 'text-red-400', icon: faBan };
    }
    if (server.status === 'installing') {
      return { text: t('common.server.state.installing', {}), color: 'text-yellow-400', icon: null, spinner: true };
    }
    if (server.status === 'restoring_backup') {
      return { text: t('common.server.state.restoringBackup', {}), color: 'text-yellow-400', icon: null, spinner: true };
    }
    if (server.status === 'install_failed') {
      return { text: t('common.server.state.InstallFailed', {}), color: 'text-yellow-400', icon: faTriangleExclamation };
    }
    // Show online/offline/starting/stopping status based on stats
    if (stats) {
      if (stats.state === 'running') {
        return { text: 'ONLINE', color: 'text-green-400', icon: null };
      }
      if (stats.state === 'starting') {
        return { text: 'STARTING', color: 'text-yellow-400', icon: null };
      }
      if (stats.state === 'stopping') {
        return { text: 'STOPPING', color: 'text-yellow-400', icon: null };
      }
      return { text: 'OFFLINE', color: 'text-red-400', icon: null };
    }
    // If no stats, show offline by default
    return { text: 'OFFLINE', color: 'text-red-400', icon: null };
  };

  return (
    <>
      <ServerAddGroupModal server={server} opened={openModal === 'add-group'} onClose={() => setOpenModal(null)} />

      <div onClick={onClick}>
        <NavLink to={`/server/${server.uuidShort}`} onClick={(e) => {
          if (sKeyPressed) {
            e.preventDefault();
          }
        }}>
          <Card
            className='duration-200 h-full flex flex-col rounded-sm! p-3!'
            leftStripeClassName={statusToColor(stats?.state)}
            hoverable
          >
            {/* Header */}
            <div className='flex items-start justify-between gap-2 mb-2'>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-2 min-w-0'>
                  <h3 className='text-base font-semibold text-white truncate' title={server.name}>
                    {server.name}
                  </h3>
                  {!serverListShowOthers && serverGroups.every((g) => !g.serverOrder.includes(server.uuid)) && (
                    <Tooltip label={t('pages.account.home.tooltip.noGroup', {})}>
                      <FontAwesomeIcon icon={faInfoCircle} className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />
                    </Tooltip>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className='flex items-center gap-1 flex-shrink-0'>
                {showSelection && (
                  <Tooltip
                    label={isSelected ? t('pages.account.home.bulkActions.deselect', {}) : t('pages.account.home.bulkActions.select', {})}
                  >
                    <ActionIcon
                      size='sm'
                      variant={isSelected ? 'filled' : 'light'}
                      color={isSelected ? 'green' : 'gray'}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectionChange?.(!isSelected);
                      }}
                    >
                      <FontAwesomeIcon icon={isSelected ? faCheckCircle : faCircle} size='sm' />
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
                  >
                    <ActionIcon
                      size='sm'
                      variant='light'
                      color='gray'
                      disabled={serverGroups.length === 0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenModal('add-group');
                      }}
                    >
                      <FontAwesomeIcon icon={faAdd} size='sm' />
                    </ActionIcon>
                  </Tooltip>
                )}
                {onGroupRemove && (
                  <Tooltip label={t('pages.account.home.tooltip.removeFromGroup', {})}>
                    <ActionIcon
                      size='sm'
                      color='red'
                      variant='light'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onGroupRemove();
                      }}
                    >
                      <FontAwesomeIcon icon={faMinus} size='sm' />
                    </ActionIcon>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Resource Stats - 2x2 Grid */}
            {stats && !server.suspended && !server.status && (
              <div className='mt-auto pt-2 border-t border-dark-4'>
                <div className='grid grid-cols-2 gap-3'>
                  {/* IP Address */}
                  <div className='flex items-center gap-2'>
                    <FontAwesomeIcon icon={faNetworkWired} className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />
                    <div className='min-w-0 flex-1'>
                      {server.allocation ? (
                        server.egg.separatePort ? (
                          <div className='flex items-center gap-1 flex-wrap'>
                            <CopyOnClick content={server.allocation.ipAlias ?? server.allocation.ip}>
                              <span className='text-xs text-white hover:text-gray-300 transition-colors font-mono truncate cursor-pointer'>
                                {server.allocation.ipAlias ?? server.allocation.ip}
                              </span>
                            </CopyOnClick>
                            <span className='text-gray-500'>:</span>
                            <CopyOnClick content={server.allocation.port.toString()}>
                              <span className='text-xs text-white hover:text-gray-300 transition-colors font-mono cursor-pointer'>
                                {server.allocation.port}
                              </span>
                            </CopyOnClick>
                          </div>
                        ) : (
                          <CopyOnClick content={formatAllocation(server.allocation)}>
                            <span className='text-xs text-white hover:text-gray-300 transition-colors font-mono truncate cursor-pointer'>
                              {formatAllocation(server.allocation)}
                            </span>
                          </CopyOnClick>
                        )
                      ) : (
                        <span className='text-xs text-gray-500'>{t('common.server.noAllocation', {})}</span>
                      )}
                    </div>
                  </div>

                  {/* Memory */}
                  <div className='flex items-center gap-2'>
                    <FontAwesomeIcon icon={faMemory} className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />
                    <div className='min-w-0 flex-1'>
                      <span className='text-xs text-white'>{bytesToString(stats.memoryBytes)}</span>
                      <span className='text-[10px] text-gray-500 ml-1'>/ {memoryLimit}</span>
                    </div>
                  </div>

                  {/* CPU */}
                  <div className='flex items-center gap-2'>
                    <FontAwesomeIcon icon={faMicrochip} className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />
                    <div className='min-w-0 flex-1'>
                      <span className='text-xs text-white'>{stats.cpuAbsolute.toFixed(1)}%</span>
                      <span className='text-[10px] text-gray-500 ml-1'>/ {cpuLimit}</span>
                    </div>
                  </div>

                  {/* Disk/Storage */}
                  <div className='flex items-center gap-2'>
                    <FontAwesomeIcon icon={faHardDrive} className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />
                    <div className='min-w-0 flex-1'>
                      <span className='text-xs text-white'>{bytesToString(stats.diskBytes)}</span>
                      <span className='text-[10px] text-gray-500 ml-1'>/ {diskLimit}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </NavLink>
      </div>
    </>
  );
}
