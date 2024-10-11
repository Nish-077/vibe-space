import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) return Response.json({ error: "Unauthorised" }, { status: 401 });

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const noOfPostsPerpage = 10;

    const posts = await prisma.post.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: user.id,
            },
          },
        },
      },
      take: noOfPostsPerpage + 1,
      orderBy: { createdAt: "desc" },
      cursor: cursor ? { id: cursor } : undefined,
      include: getPostDataInclude(user.id),
    });

    const nextCursor = posts.length > noOfPostsPerpage ? posts[noOfPostsPerpage].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, noOfPostsPerpage),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
