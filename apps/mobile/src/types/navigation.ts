import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  NoteDetail: { noteId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Chat: undefined;
  Notes: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}