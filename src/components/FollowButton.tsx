"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import kyInstance from "@/lib/ky";

interface FollowButtonProps {
  userId: string;
  userName: string;
  initialState: FollowerInfo;
}

export default function FollowButton({
  userId,
  userName,
  initialState,
}: FollowButtonProps) {
  const { data } = useFollowerInfo(userId, initialState);

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["follower-info", userId];

  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: () =>
      data.isUserFollowing
        ? kyInstance.delete(`api/users/${userId}/followers`).json()
        : kyInstance.post(`api/users/${userId}/followers`).json(),
    onMutate: () => {
      const prevState = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followersCount:
          (prevState?.followersCount || 0) +
          (prevState?.isUserFollowing ? -1 : 1),
        isUserFollowing: !prevState?.isUserFollowing,
      }));

      return { prevState };
    },
    onError(error, variables, context) {
      console.error(error);
      queryClient.setQueryData<FollowerInfo>(queryKey, context?.prevState);
      toast({
        variant: "destructive",
        description: `Couldn't ${context?.prevState?.isUserFollowing ? "Unfollow" : "Follow"} ${userName}. Please Try Again`,
      });
    },
    onSuccess(data, variables, context) {
      toast({
        description: `You ${context?.prevState?.isUserFollowing ? "Unfollowed" : "are now Following"} ${userName}.`,
      });
    },
  });

  return (
    <Button
      variant={data.isUserFollowing ? "secondary" : "default"}
      onClick={() => mutation.mutate()}
    >
      {data.isUserFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
