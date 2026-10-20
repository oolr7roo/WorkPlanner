import type { Schedule, TreeRow } from "./types";

export function siblings(items: Schedule[], parentId: string | null): Schedule[] {
  return items.filter(item => item.parentId === parentId).sort((a, b) => a.order - b.order);
}

export function visibleRows(items: Schedule[], collapsed: Set<string>): TreeRow[] {
  const rows: TreeRow[] = [];
  const visit = (parentId: string | null, ancestry: string[]) => {
    for (const schedule of siblings(items, parentId)) {
      const hasChildren = items.some(item => item.parentId === schedule.id);
      rows.push({ schedule, depth: ancestry.length, ancestry, hasChildren });
      if (!collapsed.has(schedule.id)) visit(schedule.id, [...ancestry, schedule.id]);
    }
  };
  visit(null, []);
  return rows;
}

export function reorder(items: Schedule[], id: string, targetId: string): Schedule[] {
  const item = items.find(item => item.id === id);
  const target = items.find(item => item.id === targetId);
  if (!item || !target || item.parentId !== target.parentId) return items;
  const group = siblings(items, item.parentId);
  const from = group.findIndex(item => item.id === id);
  const to = group.findIndex(item => item.id === targetId);
  group.splice(to, 0, ...group.splice(from, 1));
  const orders = new Map(group.map((item, index) => [item.id, index]));
  return items.map(item => orders.has(item.id) ? { ...item, order: orders.get(item.id)! } : item);
}

// Delete one node while preserving its children in its position.
export function removeSchedule(items: Schedule[], id: string): Schedule[] {
  const item = items.find(item => item.id === id);
  if (!item) return items;
  const group = siblings(items, item.parentId);
  const promoted = group.flatMap(entry => entry.id === id ? siblings(items, id) : [entry]);
  const orders = new Map(promoted.map((entry, index) => [entry.id, index]));
  return items.filter(entry => entry.id !== id).map(entry => orders.has(entry.id)
    ? { ...entry, parentId: item.parentId, order: orders.get(entry.id)! } : entry);
}
