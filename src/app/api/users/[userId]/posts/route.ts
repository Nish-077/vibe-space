import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const noOfPostsPerPage = 10;

    const posts = await prisma.post.findMany({
      where: {
        userId,
      },
      include: getPostDataInclude(loggedInUser.id),
      orderBy: { createdAt: "desc" },
      take: noOfPostsPerPage + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      posts.length > noOfPostsPerPage ? posts[noOfPostsPerPage].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, noOfPostsPerPage),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
