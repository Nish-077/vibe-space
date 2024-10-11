import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";

export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  // using normal Request instead of Nextrequest. since Next request is same as Request but has some additional helper fns
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser)
      return Response.json({ error: "Unauthorised" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: { followerId: loggedInUser.id },
          select: { followerId: true },
        },
        _count: {
          select: { followers: true },
        },
      },
    });

    if (!user)
      return Response.json({ error: "User Not Found" }, { status: 404 });

    const data: FollowerInfo = {
      followersCount: user._count.followers,
      isUserFollowing: !!user.followers.length, //the double excaimation converts the result to boolean
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser)
      return Response.json({ error: "Unauthorised" }, { status: 401 });

    if (!userId)
      return Response.json({ error: "User Not Found" }, { status: 404 });

    await prisma.follow.upsert({
      // used upsert instead of create, cuz when a follow already exists to 2 specific users, the upsert will ignore the operation
      where: {
        followerId_followingId: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      },
      create: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
      update: {}, //if there exists an entry, just ignore. so do nothing to update
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser)
      return Response.json({ error: "Unauthorised" }, { status: 401 });

    if (!userId)
      return Response.json({ error: "User Not Found" }, { status: 404 });

    await prisma.follow.deleteMany({
      // used deleteMany cuz its a counter-part to upsert. so if there is no entry of a particular connection. it wont throw an error. instead it will simply do nothing in that case
      where: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
