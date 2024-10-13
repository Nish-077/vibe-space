"use client";

import useUserPostsCount from "@/hooks/useUserPostsCount";
import { formatCount } from "@/lib/utils";

interface PostsCountProps {
  userId: string;
  initialPostsCount: number;
}

export default function PostsCount({
  userId,
  initialPostsCount,
}: PostsCountProps) {
  const { data } = useUserPostsCount(userId, initialPostsCount);

  return (
    <span>
      Posts:{" "}
      <span className="font-semibold">{formatCount(data)}</span>
    </span>
  );
}
