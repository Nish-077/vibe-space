"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error: string }> {
  try {
    const { email, userName, password } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      // this is copied from lucia docs itself so no need to know what the configuration values r supposed to do
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    const existingUserName = await prisma.user.findFirst({
      where: {
        userName: {
          equals: userName,
          mode: "insensitive", //both lowercase and uppercase versions are considered same
        },
      },
    });

    if (existingUserName) {
      return {
        error: "Username already taken",
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return {
        error: "Email already exists",
      };
    }

    await prisma.user.create({
      data: {
        id: userId,
        userName,
        displayName: userName,
        email,
        passwordHash,
      },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );


    return redirect("/"); //imported from next/navigation. This func returns type 'never'. so the async funciton expecting 'error' as the return type will not cause an issue even if the return type is not exactly 'error'
  } catch (error) {
    if (isRedirectError(error)) throw error; //IMP: redirect func throws an error for redirecting and that will be caught by the catch block. so we check if its redirect error and throw it again for the redirect to work.

    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
