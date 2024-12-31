"use client";

import kyInstance from "@/lib/ky";
import { UserData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { PropsWithChildren } from "react";
import UserToolTip from "./UserToolTip";
import Link from "next/link";

interface UserLinkWithToolTipProps extends PropsWithChildren {
  userName: string;
}

export default function UserLinkWithToolTip({
  children,
  userName,
}: UserLinkWithToolTipProps) {
  const { data } = useQuery({
    queryKey: ["user-data", userName],
    queryFn: () =>
      kyInstance.get(`api/users/username/${userName}`).json<UserData>(),
    retry(failureCount, error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: Infinity,
  });

  if (!data) {
    return (
      <Link
        href={`/users/${userName}`}
        className="text-primary hover:underline"
      >
        {children}
      </Link>
    );
  }

  return (
    <UserToolTip user={data}>
      <Link
        href={`/users/${userName}`}
        className="text-primary hover:underline"
      >
        {children}
      </Link>
    </UserToolTip>
  );
}
