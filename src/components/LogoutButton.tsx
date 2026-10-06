"use client";

import { logoutAction } from "@/app/actions/auth";

export function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button type="submit" className={`btn-ghost ${className}`}>
        Çıkış
      </button>
    </form>
  );
}
