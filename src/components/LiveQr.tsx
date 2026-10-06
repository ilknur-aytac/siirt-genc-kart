"use client";

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";

type Props = {
  membershipNumber: string;
};

export function LiveQr({ membershipNumber }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/qr/issue", { method: "POST" });
    const data = (await res.json()) as { token?: string; expiresAt?: string; error?: string };
    if (!res.ok || !data.token) {
      setError(data.error ?? "Kod üretilemedi.");
      return;
    }
    setError(null);
    setToken(data.token);
    setExpiresAt(data.expiresAt ?? null);
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 45_000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSeconds(left);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-3xl bg-white p-3 shadow-inner ring-1 ring-black/5">
        {token ? (
          <QRCodeSVG
            value={`sgk:${token}`}
            size={196}
            level="M"
            bgColor="#ffffff"
            fgColor="#0c2340"
            includeMargin={false}
          />
        ) : (
          <div className="grid h-[196px] w-[196px] place-items-center text-sm text-[var(--muted)]">
            Kod hazırlanıyor…
          </div>
        )}
      </div>
      <p className="text-center text-xs text-[var(--muted)]">
        Kısa ömürlü güvenlik kodu · {seconds} sn
        <br />
        <span className="font-mono text-[10px] tracking-widest">{membershipNumber}</span>
      </p>
      {error ? <p className="text-center text-xs text-red-700">{error}</p> : null}
      <button type="button" className="btn-ghost text-xs" onClick={() => void refresh()}>
        Kodu yenile
      </button>
    </div>
  );
}
