import { fetchUserPosts } from "@/lib/actions/thread.action";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  const userDefinedThreads = await fetchUserPosts(accountId);
  return (
    <div className="mt-9 flex flex-col gap-10">
      {userDefinedThreads &&
        userDefinedThreads.threads.map((thread: any) => (
          <ThreadCard
            key={thread._id}
            id={thread._id}
            currentUserId={currentUserId}
            parentId={thread.parentId}
            content={thread.text}
            author={
              accountType === "User"
                ? {
                    name: userDefinedThreads.name,
                    image: userDefinedThreads.image,
                    id: userDefinedThreads.id,
                  }
                : {
                    name: thread.author.name,
                    image: thread.author.image,
                    id: thread.author.id,
                  }
            }
            community={thread.community}
            createdAt={thread.createdAt}
            comments={thread.children}
          />
        ))}
    </div>
  );
};
export default ThreadsTab;
