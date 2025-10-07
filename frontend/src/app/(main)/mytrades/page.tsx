"use client";
import MyTradesPage from "@/components/myTrades/MyTrades";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyTrades() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status]);

  return (
    <>
      <MyTradesPage />
    </>
  );
}
