import React from 'react';
import renderer from 'react-test-renderer';
import { ThemeProvider } from '../shared/theme/ThemeProvider';
import Chat from '../screens/Chat';

// Mock GiftedChat to avoid dependency during tests
jest.mock('react-native-gifted-chat', () => ({
  GiftedChat: (props: any) => {
    return React.createElement('GiftedChat', props, null);
  },
  Bubble: (props: any) => React.createElement('Bubble', props, null),
}));

describe('Chat Screen', () => {
  it('renders without crashing', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <Chat />
      </ThemeProvider>
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});

