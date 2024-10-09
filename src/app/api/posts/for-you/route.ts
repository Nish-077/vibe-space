import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { postDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) return Response.json({ error: "Unauthorised" }, { status: 401 });

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined; // id of post of next page

    const noOfPostsPerpage = 10;

    const posts = await prisma.post.findMany({
      include: postDataInclude,
      orderBy: { createdAt: "desc" },
      take: noOfPostsPerpage + 1, //we r making pageCount posts per page, but since we also need cursor, which is the id of the next post after this page, we add +1
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > noOfPostsPerpage ? posts[noOfPostsPerpage].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, noOfPostsPerpage),
      nextCursor,
    };

    return Response.json(data); //jsonifying a Date object inside the posts converts them to string. So that needs to be handled.
  } catch (error) {
    console.error();
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
