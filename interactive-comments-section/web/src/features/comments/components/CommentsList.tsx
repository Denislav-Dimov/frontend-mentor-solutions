import type { CommentUser, Reply, TopLevelComment } from '../types';
import type { ApiComment } from '@/features/shared/types';
import CommentCard from './CommentCard';
import CommentComposer from './CommentComposer';

type CommentsListProps = {
  currentUser: CommentUser;
  comments: ApiComment[];
};

export default function CommentsList({ currentUser, comments }: CommentsListProps) {
  const mappedComments = comments.map(comment => mapComment(comment));

  return (
    <main id="main" className="page">
      <h1 className="sr-only">Comments</h1>
      <section aria-label="Comments" className="grid gap-4 md:gap-5">
        {mappedComments.length === 0 ? (
          <div className="card text-center">
            <h2 className="text-grey-800 text-xl font-medium">No comments yet</h2>
            <p className="mt-2">Start the conversation below.</p>
          </div>
        ) : (
          mappedComments.map(comment => (
            <CommentCard key={comment.id} comment={comment} currentUser={currentUser} />
          ))
        )}
      </section>

      <CommentComposer currentUser={currentUser} />
    </main>
  );
}

function mapComment(comment: ApiComment): TopLevelComment {
  const byId = new Map<string, ApiComment>();
  const walk = (node: ApiComment) => {
    byId.set(node.id, node);
    for (const child of node.replies) walk(child);
  };
  walk(comment);
  const replies: Reply[] = [];
  const collect = (node: ApiComment) => {
    for (const child of node.replies) {
      replies.push({
        id: child.id,
        content: child.content,
        createdAt: new Date(child.createdAt).getTime(),
        score: child.score,
        vote: (child.currentUserVote ?? 0) as 0 | 1 | -1,
        user: {
          id: child.author.id,
          username: child.author.username,
          image: child.author.avatarUrl,
          isSeeded: child.author.isSeeded ?? false,
        },
        replyingTo: child.parentId
          ? (byId.get(child.parentId)?.author.username ?? node.author.username)
          : node.author.username,
      });
      collect(child);
    }
  };
  collect(comment);
  replies.sort((first, second) => first.createdAt - second.createdAt);

  return {
    id: comment.id,
    content: comment.content,
    createdAt: new Date(comment.createdAt).getTime(),
    score: comment.score,
    vote: (comment.currentUserVote ?? 0) as 0 | 1 | -1,
    user: {
      id: comment.author.id,
      username: comment.author.username,
      image: comment.author.avatarUrl,
      isSeeded: comment.author.isSeeded ?? false,
    },
    replies,
  };
}
