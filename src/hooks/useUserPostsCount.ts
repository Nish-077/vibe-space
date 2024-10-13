import kyInstance from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";

export default function useUserPostsCount(
  userId: string,
  initialPostsCount: number,
) {
  const query = useQuery({
    queryKey: ["posts-count", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/posts/count`).json<number>(),
    initialData: initialPostsCount,
    staleTime: Infinity,
  });

  return query;
}
