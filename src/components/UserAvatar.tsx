import Image from "next/image";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  displayName: string;
  avatarUrl: string | null | undefined;
  size?: number;
  classname?: string;
}

export default function UserAvatar({
  displayName,
  avatarUrl,
  size,
  classname,
}: UserAvatarProps) {
  return (
    <Image
      src={avatarUrl || avatarPlaceholder}
      alt="User Avatar"
      width={size || 48}
      height={size || 48}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        classname,
      )}
      title={displayName}
    ></Image>
  );
}
