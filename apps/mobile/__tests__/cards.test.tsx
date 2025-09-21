import React from 'react';
import renderer from 'react-test-renderer';
import { EventCard } from '../shared/ui/cards/EventCard';
import { TaskItemCard } from '../shared/ui/cards/TaskItemCard';
import { NoteSnippet } from '../shared/ui/cards/NoteSnippet';
import { ThemeProvider } from '../shared/theme/ThemeProvider';
import { EmailSnippet } from '../shared/ui/cards/EmailSnippet';

const withTheme = (node: React.ReactElement) => renderer.create(<ThemeProvider>{node}</ThemeProvider>);

describe('UI Cards', () => {
  it('renders EventCard', () => {
    const tree = withTheme(
      <EventCard event={{ title: 'Standup', start: '2024-12-01T09:00:00Z', location: 'Zoom' }} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders TaskItemCard', () => {
    const tree = withTheme(
      <TaskItemCard task={{ title: 'Write tests', due: '2024-12-02', done: false }} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders NoteSnippet', () => {
    const tree = withTheme(
      <NoteSnippet note={{ title: 'Ideas', snippet: '* item 1\n* item 2' }} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders EmailSnippet', () => {
    const tree = withTheme(
      <EmailSnippet email={{ subject: 'Hello', from: 'user@example.com', preview: 'short preview' }} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});
