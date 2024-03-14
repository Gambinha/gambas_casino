import { url } from "inspector";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  console.log("middlware");
  let cookie = request.cookies.get("auth");
  console.log("cookie", cookie);

  if (!cookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const authenticatedUser = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/verify-user`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {}

  console.log(cookie);

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/crash", "/roulette", "/mines"],
};
