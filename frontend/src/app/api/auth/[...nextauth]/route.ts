import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Assign values from backend (user object passed from signIn)
        token._id = user._id; 
        token.role = user.role || "user";
        token.adminId = user.adminId;
        token.permissions = user.permissions;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id as string;
        session.user.role = token.role as string;
        session.user.adminId = token.adminId as string;
        session.user.permissions = token.permissions as string[];
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Check if user is trying to access admin area
      const isAdminAccess = typeof account?.redirect_uri === "string" && account.redirect_uri.includes('/admin');
      
      // If accessing admin area, only allow specific email
      if (isAdminAccess && user.email !== "pinjaridastageer@gmail.com") {
        return false; // Deny access
      }

      try {
        // Check if this is an admin login
        if (user.email === "pinjaridastageer@gmail.com") {
          // Use admin authentication endpoint
          const adminRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: account?.provider || "google",
              providerId: user.id,
            }),
          });
          
          if (adminRes.ok) {
            const adminResult = await adminRes.json();
            user._id = adminResult.admin._id;
            user.adminId = adminResult.admin.adminId;
            user.role = "admin";
            user.permissions = adminResult.admin.permissions;
            user.isAdmin = true;
          } else {
            console.error("Admin login failed:", await adminRes.text());
            return false;
          }
        } else {
          // Regular user login
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: user.name,
              email: user.email || "unknown",
              image: user.image,
              provider: account?.provider || "unknown",
              providerId: user.id,
            }),
          });
          const result = await res.json();
          console.log('result', result)
          user._id = result._id || result.user._id;
          user.role = result.role || result.user.role || "user";
        }
      } catch (error) {
        console.error("Error posting user to backend", error);
        // at time of github email is undefined so check if any field is undefined then return a box image is not important if email or name is undefined then return a box then ask to user to fill the details
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Add GitHub provider if needed
