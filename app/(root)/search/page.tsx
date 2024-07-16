import { currentUser } from "@clerk/nextjs/server";
import { fetchUser, fetchUsers } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import UserCard from "@/components/cards/UserCard";

const Search = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo) return null;
  if (!userInfo?.onboarded) redirect("/onboarding");
  // Fetch Users
  const result = await fetchUsers({
    userId: user.id,
    searchString: "",
    pageNumber: 1,
    pageSize: 30,
  });
  return (
    <section>
      <h2 className="head-text mb-10">Search</h2>
      {/* Search Bar */}
      <div className="mt-14 flex flex-col gap-8 p-2 md:p-4">
        {result.users.length === 0 ? (
          <p className="no-result">No users found</p>
        ) : (
          <>
            {result.users.map((person) => (
              <UserCard
                key={person.id}
                id={person.id}
                name={person.name}
                username={person.username}
                image={person.image}
                personType="User"
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default Search;
