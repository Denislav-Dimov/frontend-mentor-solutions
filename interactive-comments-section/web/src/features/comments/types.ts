type Vote = 0 | 1 | -1;

export type CommentUser = {
  id?: string;
  image: string | null;
  username: string;
  isSeeded: boolean;
};

export type BaseComment = {
  id: string;
  content: string;
  createdAt: number;
  score: number;
  user: CommentUser;
  vote: Vote;
};

export type Reply = BaseComment & {
  replyingTo: string;
};

export type TopLevelComment = BaseComment & {
  replies: Reply[];
};

export type AnyComment = TopLevelComment | Reply;
