"use client";
import AITradingSuggestions from "@/components/aisuggestion/AIsuggestion";
import AiTradeDashboard from "@/components/aiReport/AiTradeDashboard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AIPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status]);

  return (
    <>
      <AITradingSuggestions />
      <AiTradeDashboard />
    </>
  );
}
