export type AssignedUser = {
  userId: string;
  username: string;
};

export type TaskUpdatedPayload = {
  event: "task.updated";
  actorId: string;
  actorName: string;
  task: {
    id: string;
    title: string;
    ownerId: string;
    ownerName: string;
  };
  before: {
    status?: string;
    assignedUserIds?: AssignedUser[];
  };
  after: {
    status?: string;
    assignedUserIds?: AssignedUser[];
  };
};

export type NotificationPayload =
  | { event: "task.created"; task: { id: string; title: string }; actorName: string }
  | TaskUpdatedPayload
  | { event: "comment.new"; task: { id: string; title: string }; actorName: string };
