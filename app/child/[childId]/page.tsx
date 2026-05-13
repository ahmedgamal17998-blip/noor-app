"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ChildIndexPage() {
  const router = useRouter();
  const params = useParams<{ childId: string }>();

  useEffect(() => {
    router.replace(`/child/${params.childId}/journey`);
  }, [params.childId, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-masjid font-bold animate-pulse">جاري التحويل...</div>
    </main>
  );
}
