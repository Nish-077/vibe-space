"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { formatCount } from "@/lib/utils";

interface FollowersCountProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowersCount({
  userId,
  initialState,
}: FollowersCountProps) {
  const { data } = useFollowerInfo(userId, initialState);

  return (
    <span>
      Followers:{" "}
      <span className="font-semibold">{formatCount(data.followersCount)}</span>
    </span>
  );
}
