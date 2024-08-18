import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { userDataSelect } from "@/lib/types";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import UserAvatar from "./UserAvatar";
import { Button } from "./ui/button";
import { unstable_cache } from "next/cache";
import { formatCount } from "@/lib/utils";

export default function TrendsSideBar() {
  //Since this is a server side component, it needs to load first. so when page gets reloaded, if for some reason server rendering is getting delayed, it will block the whole page reload which we dont want. So we add the Suspense component which shows a loading icon and rest of the page gets loaded
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

async function WhoToFollow() {
  const { user } = await validateRequest();

  if (!user) return;

  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
    },
    select: userDataSelect,
    take: 5,
  });

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Who to Follow</div>
      {usersToFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <Link
            href={`/users/${user.userName}`}
            className="flex items-center gap-3"
          >
            <UserAvatar
              avatarUrl={user.avatarUrl}
              displayName={user.displayName}
              classname="flex-none"
            />
            <div>
              <p className="line-clamp-1 break-all font-semibold hover:underline">
                {user.displayName}
              </p>
              <p className="line-clamp-1 break-all text-muted-foreground">
                @{user.userName}
              </p>
            </div>
          </Link>
          <Button>Follow</Button>
        </div>
      ))}
    </div>
  );
}

//postgress's full text search is a very heavy operationandcant execute every single time, but we dont have static rendering as well

const getTrendingTopics = unstable_cache(
  //this is nextjs feature and different from react's cache. this caches on server unlike react cache which cache's every req on client side. Allows us to cache btwn multiple reqs and btwn diff users
  async () => {
    // we need to do a raw sql query since its heavy for prisma ORM itself and this is how it looks like to get the count of all hashtags
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
            SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
            FROM posts
            GROUP BY (hashtag)
            ORDER BY count DESC, hashtag ASC
            LIMIT 5
        `;
    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count), //converts bigint into a normal number
    }));
  },
  ["trending_topics"],
  {
    revalidate: 3 * 60 * 60, //calls it every 3 hours
  },
);

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics(); // in prod, it will be cached for 3 hours
  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Trending Topics</div>
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1];

        return (
          <Link key={title} href={`/hashtag/${title}`} className="block">
            <p
              className="line-clamp-1 break-all font-semibold hover:underline"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatCount(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
