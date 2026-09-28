import type { SVGProps } from 'react';

import { cn } from '@/lib/utils';
import { iconRegistry, type IconName } from './icon-registry';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: IconName;
  size?: number | string;
};

export function Icon({ name, size = '1em', className, ...props }: IconProps) {
  const definition = iconRegistry[name];
  const accessibilityProps = props['aria-label'] === undefined && props['aria-hidden'] === undefined
    ? { 'aria-hidden': true as const }
    : {};

  if (definition.provider === 'lucide') {
    const LucideIcon = definition.component;
    return (
      <LucideIcon
        data-icon-name={name}
        data-icon-provider="lucide"
        size={size}
        className={className}
        {...accessibilityProps}
        {...props}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      focusable="false"
      data-icon-name={name}
      data-icon-provider="material-community"
      className={cn('shrink-0', className)}
      {...accessibilityProps}
      {...props}
    >
      <path d={definition.path} />
    </svg>
  );
}
