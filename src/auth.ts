import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "./lib/prisma";
import { Lucia, Session, User } from "lucia";
import { cache } from "react";
import { cookies } from "next/headers";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production", // we use secure only when in prod since in dev, we use http://localhost which isnt secure.
    },
  },
  getUserAttributes(databaseUserAttributes){
    //everytime we fetch session in frontend we get all the attributes as well and dont need to request to db again.
    return {
      id: databaseUserAttributes.id,
      userName: databaseUserAttributes.userName,
      displayName: databaseUserAttributes.displayName,
      avatarUrl: databaseUserAttributes.avatarUrl,
      googleId: databaseUserAttributes.googleId,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: string;
  userName: string;
  displayName: string;
  avatarUrl: string | null;
  googleId: string | null;
}

export const validateRequest = cache(
  // this doesnt cache session for multiple req but rather it creates a duplicate of the session that is recieved on every req and whenever different components of the web app need to validate the session, they recieve a duplicate of the session "cached" by this function so that we dont make a db request every time
  async (): Promise<
    //return type of async func
    { user: User; session: Session } | { user: null; session: null } // IMP: User and Session used here are imported from Lucia and not Prisma client, the | return type is when user is not logged in
  > => {
    const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId); // checks if this session exists on db

    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch (error) {
      console.error("Error setting session cookie:", error);
    }
    return result;
  },
);
