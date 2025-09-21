// React Native 0.81 type declarations
declare module 'react-native' {
  export * from 'react-native/types';
  
  import React from 'react';
  
  export interface ViewProps {
    className?: string;
    style?: any;
    children?: React.ReactNode;
  }
  
  export interface TextProps {
    className?: string;
    style?: any;
    children?: React.ReactNode;
    numberOfLines?: number;
  }
  
  export interface ScrollViewProps {
    className?: string;
    style?: any;
    contentContainerStyle?: any;
    children?: React.ReactNode;
  }
  
  export interface TouchableOpacityProps {
    className?: string;
    style?: any;
    onPress?: () => void;
    children?: React.ReactNode;
  }
  
  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const ScrollView: React.ComponentType<ScrollViewProps>;
  export const TouchableOpacity: React.ComponentType<TouchableOpacityProps>;
  export const StatusBar: React.ComponentType<any>;
  export const Alert: {
    alert: (title: string, message?: string) => void;
  };
}

