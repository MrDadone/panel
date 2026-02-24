export function formatAllocation(allocation?: ServerAllocation | NodeAllocation | null, separatePort: boolean = false) {
  return allocation
    ? separatePort
      ? allocation.ipAlias || allocation.ip
      : `${allocation.ipAlias || allocation.ip}:${allocation.port}`
    : 'No Allocation';
}

export function statusToColor(status: ServerPowerState | undefined) {
  switch (status) {
    case 'running':
      return 'bg-green-500';
    case 'starting':
      return 'bg-yellow-500';
    case 'stopping':
      return 'bg-red-500';
    case 'offline':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function generateBackupName() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const tzOffset = now.getTimezoneOffset();
  const tzSign = tzOffset <= 0 ? '+' : '-';
  const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
  const tzMinutes = String(Math.abs(tzOffset) % 60).padStart(2, '0');
  const tzFormatted = `${tzSign}${tzHours}${tzMinutes}`;

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${tzFormatted}`;
}
