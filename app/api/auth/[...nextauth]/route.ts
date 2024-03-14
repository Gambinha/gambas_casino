import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  providers: [
    CredentialsProvider({
      name: "login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "gambinhah" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log(credentials);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) return null;

        const user = await res.json();
        if (!user) return null;

        return user;
      },
    }),
    CredentialsProvider({
      name: "signup",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "gambinhah" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log(credentials);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) return null;

        const user = await res.json();
        if (!user) return null;

        return user;
      },
    }),
  ],
});

export { handler as GET, handler as POST };
