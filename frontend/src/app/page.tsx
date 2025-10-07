"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "../components/Landing";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/mytrades");
    } else if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  return <LandingPage />;
}
