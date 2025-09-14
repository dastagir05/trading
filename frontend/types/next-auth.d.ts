import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      _id?: string;
      role?: string;
      adminId?: string;
      permissions?: string[];
      isAdmin?: boolean;
    };
  }

  interface User {
    _id?: string;
    role?: string;
    adminId?: string;
    permissions?: string[];
    isAdmin?: boolean;
  }
}
