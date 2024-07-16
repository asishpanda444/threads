import PostThread from "@/components/forms/PostThread";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";

export default async function CreateThread() {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  const userId = userInfo._id.toString();
  if (!userInfo?.onboarded) redirect("/onboarding");
  return (
    <>
      <div className="head-text">Create Thread</div>
      <PostThread userId={userId} />
    </>
  );
}
