// YBIS UI Components Package
export const UI_VERSION = '1.0.0';

// Placeholder - UI components will be added later
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.ComponentType<ButtonProps> = null as any;

