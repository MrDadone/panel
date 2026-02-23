import { AxiosRequestConfig } from 'axios';
import { axiosInstance } from '@/api/axios.ts';

export default async (form: FormData, config: AxiosRequestConfig): Promise<unknown> =>
  axiosInstance.putForm('/api/admin/assets', form, config);
