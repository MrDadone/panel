const _CONVERSION_UNIT = 1024;

/**
 * Given a value in megabytes converts it back down into bytes.
 */
export function mbToBytes(megabytes: number): number {
  return Math.floor(megabytes * _CONVERSION_UNIT * _CONVERSION_UNIT);
}

/**
 * Given an amount of bytes, converts them into a human-readable string format
 * using "1024" as the divisor.
 */
export function bytesToString(bytes: number, decimals = 2): string {
  const k = _CONVERSION_UNIT;

  if (bytes < 1) return '0 Bytes';

  decimals = Math.floor(Math.max(0, decimals));
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = Number((bytes / Math.pow(k, i)).toFixed(decimals));

  return `${value} ${['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'][i]}`;
}

export function parseSize(size: string): number {
  if (!size || typeof size !== 'string') {
    return 0;
  }

  const input = size.trim().toLowerCase();

  // Match number + optional unit (allow incomplete unit typing like "2g")
  const regex = /^([\d.]+)\s*([kmgtpezy]?i?b?)?$/i;
  const match = input.match(regex);

  if (!match) {
    return 0;
  }

  const value = parseFloat(match[1]);
  if (isNaN(value)) {
    return 0;
  }

  // Default to bytes if no unit
  let unit = (match[2] || 'b').toLowerCase();

  // Normalize units: "g" -> "gb", "k" -> "kb", etc.
  if (/^[kmgtpezy]$/.test(unit)) {
    unit = unit + 'b';
  }

  const multipliers: Record<string, number> = {
    b: 1,
    kb: 1e3,
    mb: 1e6,
    gb: 1e9,
    tb: 1e12,
    pb: 1e15,
    eb: 1e18,
    zb: 1e21,
    yb: 1e24,

    kib: 1024,
    mib: 1024 ** 2,
    gib: 1024 ** 3,
    tib: 1024 ** 4,
    pib: 1024 ** 5,
    eib: 1024 ** 6,
    zib: 1024 ** 7,
    yib: 1024 ** 8,
  };

  return multipliers[unit] ? value * multipliers[unit] : 0;
}
