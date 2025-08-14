"use client"; // 🔥 Must be at top

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "../components/BoltLanding";
import { redirect } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // redirect("/chart");
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/mytrades");
    }
  }, [status]);

  return <LandingPage />;
}
