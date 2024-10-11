"use client";

import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import Post from "@/components/posts/Post";
import InfiniteScrollContainer from "@/components/infiniteScrollContainer";
import { Loader2 } from "lucide-react";

export default function FollowingFeed() {
  const {
    data,
    fetchNextPage,
    isFetching,
    hasNextPage,
    status,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "following-feed"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "api/posts/following",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") return <PostsLoadingSkeleton />;

  if (status === "success" && !posts.length && !hasNextPage)
    return (
      <p className="text-center text-muted-foreground">
        No posts found. Start following people to see their posts!
      </p>
    );

  if (status === "error")
    return (
      <p className="text-center text-muted-foreground">
        Something went wrong. Please try again later!
      </p>
    );

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      className="space-y-5"
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
