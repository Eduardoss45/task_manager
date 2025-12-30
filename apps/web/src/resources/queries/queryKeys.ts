export const queryKeys = {
  tasks: (params?: { page: number; size: number }) => (params ? ['tasks', params] : ['tasks']),
  task: (id: string) => ['task', id],
  comments: (taskId: string, page: number) => ['comments', taskId, page],
  users: ['users'],
};
