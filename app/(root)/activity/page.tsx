import { currentUser } from "@clerk/nextjs/server";
import { fetchActivity, fetchUser } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const Activity = async () => {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo) return null;
  if (!userInfo?.onboarded) redirect("/onboarding");
  // Fetch Activities
  const results = await fetchActivity(userInfo._id);
  return (
    <div className="head-text mb-10">
      <section className="mt-10 flex flex-col gap-5">
        {results.length === 0 ? (
          <p className="!text-base-regular text-light-2">No activity found</p>
        ) : (
          results.map((activity) => (
            <Link key={activity._id} href={`/thread/${activity.parentId}`}>
              <article className="activity-card ml-5">
                <Image
                  src={activity.author.image}
                  alt="Profile Picture"
                  width={20}
                  height={20}
                  className="object-contain rounded-full"
                />
                <p className="!text-small-regular text-light-1">
                  {" "}
                  <span className="mr-1 text-primary-500">
                    {activity.author.name}
                  </span>{" "}
                  {` replied to your comment`}
                </p>
              </article>
            </Link>
          ))
        )}
      </section>
    </div>
  );
};

export default Activity;
