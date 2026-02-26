"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/sidebar/skeleton";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setText("Hello David");
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <div>
      {loading ? (
        <Skeleton className="h-20 w-64" />
      ) : (
        <p>{text}</p>
      )}
    </div>
  );
}