import { TaskItem } from '../../ui/cards';

export function mapTasks(resp: any): TaskItem[] {
  const items = resp?.data?.items || resp?.items || [];
  return items.map((it: any) => ({
    title: it.title || it.name || 'Görev',
    due: it.due || it.dueDate,
    done: !!it.done || it.status === 'completed',
    priority: it.priority || 'medium',
  }));
}

