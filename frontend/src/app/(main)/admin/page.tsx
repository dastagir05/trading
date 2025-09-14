"use client";
import AdminDashboard from "@/components/Admin/AdminDashboard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      // User is not logged in, redirect to admin login
      router.push("/admin/login");
      return;
    }

    if (session?.user?.email !== "pinjaridastageer@gmail.com" || !session?.user?.isAdmin) {
      // User is logged in but not authorized for admin access
      router.push("/admin/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.email !== "pinjaridastageer@gmail.com" || !session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

// "use client"
// const CLIENT_ID = "8b01026f-26d3-40ce-b76f-e45383998856";
// const REDIRECT_URI = "http://localhost:5000"; // This is your backend endpoint
// import AdminDashboard from "@/components/Admin/AdminPage";
// export default function AdminPage() {
//     const handleLogin = () => {
//           // api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=8b01026f-26d3-40ce-b76f-e45383998856&redirect_uri=https://127.0.0.1:5000

//       const upstoxAuthURL = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=8b01026f-26d3-40ce-b76f-e45383998856&redirect_uri=https://127.0.0.1:5000`;
//       window.location.href = upstoxAuthURL;
//     };
  
//     return (
//       <>
//       <div>
//         <h1>Admin Dashboard</h1>
//         <button onClick={handleLogin}>Login with Upstox</button>
//       </div>
//       <AdminDashboard />
//       </>
//     );
//   }