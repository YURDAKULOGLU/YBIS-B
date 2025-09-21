declare module 'react-native-syntax-highlighter' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';

  export interface SyntaxHighlighterProps extends TextProps {
    language?: string;
    style?: any;
    children: string;
  }

  const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}