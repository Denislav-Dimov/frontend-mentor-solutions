import { CommentsList, type CommentUser } from '@/features/comments';
import { StatusBar } from '@/features/shared';
import { getComments, getCurrentUser } from '@/features/shared/api/server';

export default async function HomePage() {
  const [comments, user] = await Promise.all([getComments(), getCurrentUser()]);
  const currentUser: CommentUser = user
    ? {
        id: user.id,
        username: user.username,
        image: user.avatarUrl,
        isSeeded: user.isSeeded ?? false,
      }
    : { username: 'guest', image: '/images/image-default.png', isSeeded: false };
  return (
    <>
      <StatusBar user={user} />
      <CommentsList currentUser={currentUser} comments={comments} />
    </>
  );
}
