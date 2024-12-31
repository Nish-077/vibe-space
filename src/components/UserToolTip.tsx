"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { FollowerInfo, UserData } from "@/lib/types";
import { PropsWithChildren } from "react";
import FollowButton from "./FollowButton";
import { Tooltip, TooltipContent, TooltipProvider } from "./ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import Linkify from "./linkify";
import FollowersCount from "./FollowersCount";

interface UserToolTipProps extends PropsWithChildren {
  user: UserData;
}

export default function UserToolTip({ children, user }: UserToolTipProps) {
  const { user: loggedInUser } = useSession();

  const followerInfo: FollowerInfo = {
    followersCount: user._count.followers,
    isUserFollowing: !!user.followers.some(
      // !! => converts any value to boolean explicitly
      ({ followerId }) => followerId === loggedInUser.id,
    ),
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 break-words px-1 py-2.5 md:min-w-52">
            <div className="flex items-center justify-evenly gap-3">
              <div className="flex items-center gap-3">
                <Link href={`/users/${user.userName}`}>
                  <UserAvatar
                    avatarUrl={user.avatarUrl}
                    displayName={user.displayName}
                    size={70}
                  />
                </Link>
                <div>
                  <Link href={`/users/${user.userName}`}>
                    <div className="text-lg font-semibold hover:underline">
                      {user.displayName}
                    </div>
                    <div className="text-muted-foreground">
                      @{user.userName}
                    </div>
                  </Link>
                </div>
              </div>
              <FollowersCount initialState={followerInfo} userId={user.id} />
            </div>
            {true && (
              <Linkify>
                <div className="line-clamp-4 whitespace-pre-line">
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi
                  quasi consectetur quisquam a, distinctio cumque dolorum
                  veritatis ab assumenda facilis expedita vero, inventore
                  molestias eaque sed nam eum earum, maiores saepe qui sequi
                  repellendus voluptatum aut dolores. Optio, cumque aspernatur.
                </div>
              </Linkify>
            )}
            {loggedInUser.id !== user.id && (
              <FollowButton
                initialState={followerInfo}
                userId={user.id}
                userName={user.userName}
              />
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
