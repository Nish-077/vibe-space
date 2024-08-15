"use server";

import prisma from "@/lib/prisma";
import { loginSchema, LoginValues } from "@/lib/validation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { verify } from "@node-rs/argon2";
import { lucia } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(
  credentials: LoginValues,
): Promise<{ error: string }> {
  try {
    const { userName, password } = loginSchema.parse(credentials);

    const existingUser = await prisma.user.findFirst({
      where: {
        userName: {
          equals: userName,
          mode: "insensitive",
        },
      },
    });

    if (!existingUser || !existingUser.passwordHash) {
      // if a username exists but if they logged in using google login and not useing password, then we should allow them to login only with google login since we wont have their password to authenticate
      return {
        error: "Incorrect username or password", // error msg shouldnt specify why we couldnt log them in for security reasons
      };
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      // this is copied from lucia docs itself so no need to know what the configuration values r supposed to do
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      return {
        error: "Incorrect username or password",
      };
    }

    const session = await lucia.createSession(existingUser.id, {});

    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);

    return {
      error: "Something went wrong. Please Try again",
    };
  }
}
