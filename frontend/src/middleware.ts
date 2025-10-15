import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Check if the user is trying to access admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
          // Allow access to admin login page
          if (req.nextUrl.pathname === "/admin/login") {
            return true;
          }

          // For other admin routes, check if user has admin email
          return token?.email === "pinjaridastageer@gmail.com";
        }

        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/mytrades") ||
          pathname.startsWith("/chart") ||
          pathname.startsWith("/aisuggestion") ||
          pathname.startsWith("/profile")
        ) {
          return !!token; // user must be logged in
        }
        // For non-admin routes, allow access
        return true;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/mytrades/:path*",
    "/chart/:path*",
    "/aisuggestion/:path*",
    "/profile/:path*",
  ],
};
