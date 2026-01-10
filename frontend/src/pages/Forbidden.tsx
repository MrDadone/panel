import ContentContainer from '@/elements/containers/ContentContainer.tsx';
import ScreenBlock from '@/elements/ScreenBlock.tsx';

export default function Forbidden() {
  return (
    <ContentContainer title='Forbidden'>
      <ScreenBlock title='403' description='You do not have access to this page' />
    </ContentContainer>
  );
}
