import { useToast } from "@/components/ui/use-toast";
import { submitPost } from "./actions";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { PostsPage } from "@/lib/types";

export function useSubmitPostMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      //We can use react-query's queryClient to invalidate the cache and refetch all posts again but, doing so will invalidate all pages that use same query key from cache, cached during infinite query loading. Hence, its better to return the new post into the cache manually by ourselves.
      const queryFilter: QueryFilters = { queryKey: ["post-feed", "for-you"] };
      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      queryClient.invalidateQueries({ //this will be run only when the oldData is null, meaning first page hasnt been loaded and if queryCancel is executed before thatm then it wont load any pages at all. so to fix that bug we invalidate the query key, fetching the data again.
        queryKey: queryFilter.queryKey, //invalidateQueries takes queryFilter object as argument but although we are passing queryFilter.queryKey, so that we can define logic in predicate which is a part of queryFilter object. 
        predicate(query){
            return !query.state.data; // returns true if no data in query state and hence leads to invalidation of query key.
        }
      })

      toast({
        description: "Posted Created Successfully!",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to Post. Pleast try again later",
      });
    },
  });

  return mutation;
}
