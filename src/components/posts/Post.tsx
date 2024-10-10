"use client";

import { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";
import PostMoreButton from "./PostMoreButton";
import { useSession } from "@/app/(main)/SessionProvider";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Link href={`/users/${post.user.userName}`}>
            <UserAvatar
              avatarUrl={post.user.avatarUrl}
              displayName={post.user.displayName}
            />
          </Link>
          <div>
            <Link
              href={`/users/${post.user.userName}`}
              className="block font-medium hover:underline"
            >
              {post.user.displayName}
            </Link>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {user.id === post.user.id && <PostMoreButton post={post} className="opacity-0 transition-opacity group-hover/post:opacity-100"/>}
      </div>
      <div className="whitespace-pre-line break-words">{post.content}</div>
    </article>
  );
}
