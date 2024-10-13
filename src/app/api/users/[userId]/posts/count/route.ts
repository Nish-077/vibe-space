import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser)
      return Response.json({ error: "Unauthorised" }, { status: 401 });

    const postsCount = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return Response.json(postsCount?._count.posts || 0);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
