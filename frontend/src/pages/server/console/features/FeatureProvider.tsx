import { useServerStore } from '@/stores/server.ts';
import EulaModalFeature from './EulaModalFeature.tsx';

export default function FeatureProvider() {
  const { server } = useServerStore();

  return server ? (
    <>
      {server.egg.features.includes('eula') && <EulaModalFeature />}{' '}
      {window.extensionContext.consoleFeatures
        .filter((feature) => !feature.filter || feature.filter(server.egg.features))
        .map((feature, i) => (
          <feature.component key={`feature-${i}`} />
        ))}
    </>
  ) : null;
}
