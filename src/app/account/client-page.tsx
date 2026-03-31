"use client";

import { useEffect, useState } from "react";

import { AccountShell, type AccountState } from "@/components/account/account-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const initialState: AccountState = {
  configured: Boolean(getSupabaseBrowserClient()),
  isLoggedIn: false,
  profile: null,
  likes: [],
  bookmarks: [],
  comments: [],
};

export function AccountClientPage() {
  const [state, setState] = useState<AccountState>(initialState);

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

      const response = await fetch("/api/account/summary", {
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : undefined,
      });

      if (!response.ok || !isMounted) {
        return;
      }

      setState((await response.json()) as AccountState);
    }

    void loadState();

    return () => {
      isMounted = false;
    };
  }, []);

  return <AccountShell state={state} />;
}
