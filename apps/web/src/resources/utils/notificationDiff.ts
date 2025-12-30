import type { AssignedUser } from "@/types/notifications";

export function diffAssignedUsers(before: AssignedUser[] = [], after: AssignedUser[] = []) {
  const beforeIds = new Set(before.map(u => u.userId));
  const afterIds = new Set(after.map(u => u.userId));

  const added = after.filter(u => !beforeIds.has(u.userId));
  const removed = before.filter(u => !afterIds.has(u.userId));

  return { added, removed };
}
