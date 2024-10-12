import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import FollowersCount from "@/components/FollowersCount";
import TrendsSideBar from "@/components/TrendsSideBar";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import {
  FollowerInfo,
  getUserDataSelect,
  UserData,
} from "@/lib/types";
import { formatCount } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import UserPosts from "./UserPosts";


const getUser = cache(async (userName: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      userName: {
        equals: userName,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) notFound();

  return user;
});


interface PageProps {
  params: { userName: string };
}


export async function generateMetadata({
  params: { userName },
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};

  const user = await getUser(userName, loggedInUser.id);

  return {
    title: `${user.displayName} (@${user.userName})`,
  };
}


interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}


async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followersCount: user._count.followers,
    isUserFollowing: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ),
  };

  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={250}
        displayName={user.displayName}
        classname="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.userName}</div>
          </div>
          <div>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatCount(user._count.posts)}
              </span>
            </span>
            <FollowersCount userId={user.id} initialState={followerInfo} />{" "}
            {/*we make seperate component cuz we need optimistic updates on follower count which we get by using useFollowerInfo hook. A hook cannot be used in a server component, hence we create a seperate client component.*/}
          </div>
        </div>
        {user.id === loggedInUserId ? (
          <Button>Edit Profile</Button>
        ) : (
          <FollowButton
            initialState={followerInfo}
            userId={user.id}
            userName={user.userName}
          />
        )}
      </div>
      {user.bio && (
        <>
          <hr />
          <div className="overflow-hidden whitespace-pre-line break-words">
            {user.bio}
          </div>
        </>
      )}
    </div>
  );
}


export default async function Page({ params: { userName } }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return <p>You&apos;re not authorized to view this page</p>;
  }

  generateMetadata({ params: { userName } });

  const user = await getUser(userName, loggedInUser.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile loggedInUserId={loggedInUser.id} user={user} />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s Posts
          </h2>
        </div>
        <UserPosts userId={user.id} userName={user.userName} />
      </div>
      <TrendsSideBar />
    </main>
  );
}
