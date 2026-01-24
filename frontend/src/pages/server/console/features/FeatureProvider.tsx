import { useServerStore } from '@/stores/server.ts';
import EulaModalFeature from './EulaModalFeature.tsx';

export default function FeatureProvider() {
  const { server } = useServerStore();

  return server ? (
    <>
      {server.egg.features.includes('eula') && <EulaModalFeature />}
      {window.extensionContext.extensionRegistry.pages.server.console.features
        .filter((feature) => !feature.filter || feature.filter(server.egg.features))
        .map(({ component: Component }, i) => (
          <Component key={`feature-${i}`} />
        ))}
    </>
  ) : null;
}
