"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import Chart from "../../../components/chart/Chart";

export default function ChartPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status]);

  return (
    <>
      <main>
        <Suspense fallback={<div>Loading Chart</div>}>
          <Chart />
        </Suspense>
      </main>
    </>
  );
}
