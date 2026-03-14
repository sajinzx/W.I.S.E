'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-24 animate-pulse bg-slate-800/50 rounded-lg"></div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
          Dashboard
        </Link>
        <button 
          onClick={() => signOut()}
          className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all text-sm font-medium border border-slate-700/50"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => signIn()}
      className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-medium text-sm"
    >
      Sign In
    </button>
  );
}
