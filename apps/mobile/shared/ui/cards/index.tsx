export { EventCard } from './EventCard';
export type { Event } from './EventCard';
export { TaskItemCard } from './TaskItemCard';
export type { TaskItem } from './TaskItemCard';
export { NoteSnippet } from './NoteSnippet';
export type { Note } from './NoteSnippet';
export { EmailSnippet } from './EmailSnippet';
export type { Email } from './EmailSnippet';

import React from 'react';
import { EventCard } from './EventCard';
import { TaskItemCard } from './TaskItemCard';
import { NoteSnippet } from './NoteSnippet';
import { EmailSnippet } from './EmailSnippet';

export type InlineKind = 'event' | 'task' | 'email' | 'note';

export const INLINE_RENDERERS: Record<InlineKind, (payload: any) => React.ReactElement | null> = {
  event: (payload) => <EventCard event={payload} />,
  task: (payload) => <TaskItemCard task={payload} />,
  email: (payload) => <EmailSnippet email={payload} />,
  note: (payload) => <NoteSnippet note={payload} />,
};
