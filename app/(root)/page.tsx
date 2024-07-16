import ThreadCard from "@/components/cards/ThreadCard";
import { fetchPosts } from "@/lib/actions/thread.action";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const posts = await fetchPosts(1, 20);
  const user = await currentUser();
  if (!user) return null;
  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-10 flex flex-col gap-10">
        {posts.parentThreads?.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {posts.parentThreads?.map((post) => (
              <ThreadCard
                key={post._id}
                id={post._id}
                currentUserId={user?.id}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>
    </>
  );
}
