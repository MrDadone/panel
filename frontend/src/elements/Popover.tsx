import {
  Popover as MantinePopover,
  PopoverDropdown as MantinePopoverDropdown,
  PopoverTarget as MantinePopoverTarget,
  PopoverDropdownProps,
  PopoverProps,
  PopoverTargetProps,
} from '@mantine/core';
import { forwardRef } from 'react';

const Popover = ({ ...rest }: PopoverProps) => {
  return <MantinePopover {...rest} />;
};

const PopoverTarget = forwardRef<HTMLDivElement, PopoverTargetProps>(({ ...rest }, ref) => {
  return <MantinePopoverTarget ref={ref} {...rest} />;
});

const PopoverDropdown = forwardRef<HTMLDivElement, PopoverDropdownProps>(({ ...rest }, ref) => {
  return <MantinePopoverDropdown ref={ref} {...rest} />;
});

Popover.Target = PopoverTarget;
Popover.Dropdown = PopoverDropdown;

export default Popover;
