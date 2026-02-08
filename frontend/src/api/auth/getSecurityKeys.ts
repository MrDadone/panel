import { axiosInstance } from '@/api/axios.ts';
import { base64ToArrayBuffer } from '@/lib/transformers.ts';

function prepareCredentialOptions(options: CredentialRequestOptions): CredentialRequestOptions {
  if (!options.publicKey) {
    return options;
  }

  const publicKey = options.publicKey as PublicKeyCredentialRequestOptions;
  const processedPublicKey: PublicKeyCredentialRequestOptions = { ...publicKey };

  if (typeof publicKey.challenge === 'string') {
    processedPublicKey.challenge = base64ToArrayBuffer(publicKey.challenge);
  }

  if (publicKey.allowCredentials) {
    processedPublicKey.allowCredentials = publicKey.allowCredentials.map((credential) => {
      if (typeof credential.id === 'string') {
        return {
          ...credential,
          id: base64ToArrayBuffer(credential.id),
        };
      }
      return credential;
    });
  }

  return {
    ...options,
    publicKey: processedPublicKey,
  };
}

interface Response {
  uuid: string;
  serverTime: Date;
  options: CredentialRequestOptions;
}

export default async (user: string): Promise<Response> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/auth/login/security-key', { params: { user } })
      .then(({ data, headers }) =>
        resolve({
          uuid: data.uuid,
          serverTime: new Date(headers['date']),
          options: prepareCredentialOptions(data.options),
        }),
      )
      .catch(reject);
  });
};
