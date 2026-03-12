import { z } from 'zod';

export const serverStatus = z.enum(['installing', 'install_failed', 'restoring_backup']);

export const serverAutostartBehavior = z.enum(['always', 'unless_stopped', 'never']);
