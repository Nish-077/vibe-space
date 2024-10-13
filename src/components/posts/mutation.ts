import {
  InfiniteData,
  QueryFilters,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import { deletePost } from "./action";
import { PostData, PostsPage } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";

export function useDeletePostMutation(post: PostData) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const router = useRouter();
  const pathname = usePathname();

  const queryKey: QueryKey = ["posts-count", post.user.id];

  const mutation = useMutation({
    mutationFn: deletePost,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const prevState = queryClient.getQueryData<number>(queryKey);

      queryClient.setQueryData<number>(queryKey, (prevState ?? 0) - 1);

      return { prevState };
    },
    onSuccess: async (deletedPost) => {
      const queryFilter: QueryFilters = { queryKey: ["post-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((post) => post.id !== deletedPost.id),
            })),
          };
        },
      );

      toast({
        description: "Post Deleted Successfully!",
      });

      if (pathname === `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user.userName}`);
      }
    },
    onError: (error, variables, context) => {
      console.error(error);
      queryClient.setQueryData<number>(queryKey, context?.prevState);
      toast({
        variant: "destructive",
        description: "Failed to delete post. Please try again later",
      });
    },
  });

  return mutation;
}
