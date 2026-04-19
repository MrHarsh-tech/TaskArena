import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
      image?: string | null;
      xpPoints?: number;
      level?: number;
    };
  }

  interface User {
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    xpPoints?: number;
    level?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    xpPoints?: number;
    level?: number;
  }
}
