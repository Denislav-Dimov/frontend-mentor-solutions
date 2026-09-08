type Vote = 0 | 1 | -1;

export type UserImage = {
  png: string;
  webp: string;
};

export type CommentUser = {
  image: UserImage;
  username: string;
};

export type BaseComment = {
  id: number;
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
