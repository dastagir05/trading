"use client";
import AdminDashboard from "@/components/Admin/AdminDashboard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminLogin from "@/components/Admin/AdminLogin";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // useEffect(() => {
  //   if (status === "loading") return; // Still loading

  //   // if (status === "unauthenticated") {
  //   //   // User is not logged in
  //   //   router.push("/admin/login");
  //   //   return;
  //   // }

  //   // if (
  //   //   session?.user?.email !== "pinjaridastageer@gmail.com" ||
  //   //   !session?.user?.isAdmin
  //   // ) {
  //   //   // User is logged in but not authorized for admin access
  //   //   router.push("/admin/login");
  //   //   return;
  //   // }
  // }, [session, status, router]);

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

  if (
    status === "unauthenticated" ||
    session?.user?.email !== "pinjaridastageer@gmail.com" ||
    !session?.user?.isAdmin
  ) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
