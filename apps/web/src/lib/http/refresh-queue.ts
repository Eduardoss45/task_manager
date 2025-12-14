let isRefreshing = false;

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: any) => void;
};

let failedQueue: QueueItem[] = [];

export const refreshQueue = {
  isRefreshing: () => isRefreshing,
  start: () => (isRefreshing = true),
  stop: () => (isRefreshing = false),

  push: (item: QueueItem) => failedQueue.push(item),

  resolveAll: (token: string) => {
    failedQueue.forEach(p => p.resolve(token));
    failedQueue = [];
  },

  rejectAll: (error: any) => {
    failedQueue.forEach(p => p.reject(error));
    failedQueue = [];
  },
};
