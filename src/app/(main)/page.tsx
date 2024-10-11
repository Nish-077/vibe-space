import PostEditor from "@/components/posts/editor/PostEditor";
import TrendsSideBar from "@/components/TrendsSideBar";
import ForYouFeed from "./ForYouFeed";
import FollowingFeed from "./FollowingFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <Tabs defaultValue="for-you">
          <TabsList className="w-full h-12 bg-card gap-1 shadow-sm">
            <TabsTrigger value="for-you">For You</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <ForYouFeed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSideBar />
    </main>
  );
}
