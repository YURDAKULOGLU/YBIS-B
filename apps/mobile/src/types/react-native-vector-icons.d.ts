declare module 'react-native-vector-icons/Ionicons' {
  import { Component } from 'react';
  
  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  export default class Icon extends Component<IconProps> {}
}

