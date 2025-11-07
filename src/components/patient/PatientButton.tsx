import React from 'react';
import { Button } from '@mantine/core';
import type { PolymorphicComponentProps } from '@mantine/core';
import type { ButtonProps } from '@mantine/core';

/**
 * PatientButton Component
 * 
 * Purpose: Mobile-optimized button component for patient portal
 * Features:
 * - Touch-friendly sizing (minimum 48px height)
 * - Consistent styling across patient portal
 * - Accessibility features
 * - Loading states
 * 
 * Inputs: Extends Mantine ButtonProps with patient-specific defaults
 * Outputs: Renders a mobile-optimized button
 */

export interface PatientButtonProps extends ButtonProps {
  patientVariant?: 'primary' | 'secondary' | 'danger';
}

type PatientButtonComponentProps = PolymorphicComponentProps<'button', PatientButtonProps>;

export const PatientButton: React.FC<PatientButtonComponentProps> = ({ 
  patientVariant = 'primary',
  children,
  style,
  variant,
  color,
  ...props 
}) => {
  const getVariantProps = (pVariant: string) => {
    switch (pVariant) {
      case 'primary':
        return {
          variant: 'filled' as const,
          color: 'blue',
        };
      case 'secondary':
        return {
          variant: 'outline' as const,
          color: 'gray',
        };
      case 'danger':
        return {
          variant: 'filled' as const,
          color: 'red',
        };
      default:
        return {
          variant: 'filled' as const,
          color: 'blue',
        };
    }
  };

  const variantProps = getVariantProps(patientVariant);

  return (
    <Button
      {...props}
      variant={variant || variantProps.variant}
      color={color || variantProps.color}
      style={{
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '16px',
        padding: '12px 24px',
        minHeight: '48px',
        ...style,
      }}
    >
      {children}
    </Button>
  );
};