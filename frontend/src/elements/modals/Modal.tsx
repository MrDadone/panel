import { Group, Modal as MantineModal, ModalProps } from '@mantine/core';
import { forwardRef } from 'react';

const Modal = forwardRef<HTMLDivElement, ModalProps>(({ children, className, ...rest }, ref) => {
  return (
    <MantineModal
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      ref={ref}
      className={className}
      {...rest}
    >
      {children}
    </MantineModal>
  );
});

export default Object.assign(Modal, {
  Footer: function ModalFooter({ children }: { children: React.ReactNode }) {
    return (
      <Group mt='md' justify='flex-end'>
        {children}
      </Group>
    );
  },
});
