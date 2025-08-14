"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import MyDashboard from "@/components/dashboard/MyDashboard";
export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [realDashboard, setRealDashboard] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status]);

  return (
    <>
      <div className="mt-1 max-w-9xl mx-auto  w-full">
        <div className="text-black flex gap-4">
          {/* <h1>Welcome to the Dashboard</h1> */}
          {session?.user?.name && (
            <p className="font-semibold text-xl">Hello, {session.user.name}</p>
          )}
          {/* {session?.user?._id && <p>Hello, {session.user._id}</p>} */}

          <button
            className="bg-blue-500 text-white px-2 py-1 right-0 cursor-pointer rounded text-sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            SignOut
          </button>
          <button
            className="bg-green-500 text-white px-2 py-1 right-0 cursor-pointer rounded text-sm"
            onClick={() => setRealDashboard(!realDashboard)}
          >
            Change
          </button>
        </div>
      </div>
       <MyDashboard /> 
      {/* <div className="min-h-screen bg-gray-50 p-4">
        <TradingWidget />
      </div> */}
    </>
  );
}
