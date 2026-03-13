import { axiosInstance } from '@/api/axios.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

interface Data {
  servers: string[];
  nodeUuid: string;
  allocationUuidRandom: boolean;
  allocationUuidsRandom: boolean;
  allocationRespectEggPortRange: boolean;
  transferBackups: boolean;
  deleteSourceBackups: boolean;
  archiveFormat: ArchiveFormat;
  compressionLevel: CompressionLevel | null;
  multiplexChannels: number;
}

export default async (nodeUuid: string, data: Data): Promise<{ affected: number }> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/admin/nodes/${nodeUuid}/servers/transfer`, transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};
