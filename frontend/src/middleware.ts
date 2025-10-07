import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if the user is trying to access admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
          // Allow access to admin login page
          if (req.nextUrl.pathname === "/admin/login") {
            return true;
          }

          // For other admin routes, check if user has admin email
          return token?.email === "pinjaridastageer@gmail.com";
        }

        // For non-admin routes, allow access
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
