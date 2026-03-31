"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminShell, type AdminState } from "@/components/admin/admin-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const initialState: AdminState = {
  configured: Boolean(getSupabaseBrowserClient()),
  isAdmin: false,
  summary: {
    pendingCount: 0,
    approvedCount: 0,
  },
  comments: [],
};

export function AdminCommentsScreen() {
  const [state, setState] = useState<AdminState>(initialState);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const browserClient = supabase;
    let isMounted = true;

    async function loadState() {
      const {
        data: { session },
      } = await browserClient.auth.getSession();

      const response = await fetch("/api/admin/comments", {
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : undefined,
      });

      if (!response.ok || !isMounted) {
        return;
      }

      setState((await response.json()) as AdminState);
    }

    void loadState();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleModerate(commentId: string, status: "approved" | "rejected" | "hidden") {
    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      await fetch(`/api/admin/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
      });

      setState((current) => ({
        ...current,
        summary: {
          pendingCount: Math.max(0, current.summary.pendingCount - 1),
          approvedCount: status === "approved" ? current.summary.approvedCount + 1 : current.summary.approvedCount,
        },
        comments: current.comments.filter((comment) => comment.id !== commentId),
      }));
    });
  }

  return <AdminShell key={isPending ? "pending" : "idle"} state={state} onModerate={handleModerate} />;
}
