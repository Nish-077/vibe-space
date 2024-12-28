import { useSession } from "@/app/(main)/SessionProvider";
import { FollowerInfo, UserData } from "@/lib/types";
import { PropsWithChildren } from "react";
import FollowButton from "./FollowButton";
import { Tooltip, TooltipContent, TooltipProvider } from "./ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import Link from "next/link";
import UserAvatar from "./UserAvatar";

interface UserToolTipProps extends PropsWithChildren {
  user: UserData;
}

export default function UserToolTip({ children, user }: UserToolTipProps) {
  const { user: loggedInUser } = useSession();

  const followerInfo: FollowerInfo = {
    followersCount: user._count.followers,
    isUserFollowing: !!user.followers.some(
      ({ followerId }) => followerId === loggedInUser.id,
    ),
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 break-words px-1 py-2.5 md:min-w-52">
            <div className="flex items-center justify-center gap-3">
              <Link href={`/users/${user.userName}`}>
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  displayName={user.displayName}
                  size={70}
                />
              </Link>
              {loggedInUser.id !== user.id && (
                <FollowButton
                  initialState={followerInfo}
                  userId={user.id}
                  userName={user.userName}
                />
              )}
            </div>
          </div>
          <div>
            <Link href={`/users/${user.userName}`}>@{user.userName}</Link>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
