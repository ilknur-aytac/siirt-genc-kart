"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import type { QrPreview } from "@/lib/types";
import { formatDate } from "@/lib/format";

function extractToken(raw: string) {
  const value = raw.trim();
  if (value.startsWith("sgk:")) return value.slice(4);
  return value;
}

export function Scanner() {
  const regionId = "sgk-scanner";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [preview, setPreview] = useState<QrPreview | null>(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const lastRef = useRef("");

  async function validate(raw: string) {
    const t = extractToken(raw);
    if (!t || t === lastRef.current) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/qr/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: t }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setPreview(null);
      setMessage(data.error ?? "Doğrulama başarısız.");
      return;
    }
    lastRef.current = t;
    setToken(t);
    setPreview(data as QrPreview);
  }

  async function applyDiscount() {
    if (!token) return;
    setBusy(true);
    const res = await fetch("/api/redemptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error ?? "İndirim uygulanamadı.");
      return;
    }
    setMessage(`İndirim uygulandı (%${data.percentage}).`);
    setPreview(null);
    setToken("");
  }

  useEffect(() => {
    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          void validate(decoded);
        },
        () => undefined,
      )
      .catch(() => {
        setCameraError("Kamera açılamadı. Kodu elle girebilirsiniz.");
      });

    return () => {
      void Promise.resolve(scanner.stop())
        .catch(() => undefined)
        .finally(() => {
          void Promise.resolve(scanner.clear()).catch(() => undefined);
        });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[28px] bg-black shadow-xl">
        <div id={regionId} className="min-h-[280px] w-full bg-zinc-900" />
      </div>
      {cameraError ? <p className="text-sm text-amber-800">{cameraError}</p> : null}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          void validate(String(fd.get("manual") ?? ""));
        }}
      >
        <input
          name="manual"
          className="input"
          placeholder="Kodu yapıştırın veya tarayın"
          autoComplete="off"
        />
        <button className="btn-primary shrink-0" type="submit" disabled={busy}>
          Doğrula
        </button>
      </form>

      {message ? <p className="rounded-2xl bg-white px-4 py-3 text-sm shadow-sm">{message}</p> : null}

      {preview ? (
        <div className="card space-y-4 p-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[var(--navy)]">
              {preview.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-white">
                  {preview.firstName[0]}
                  {preview.lastName[0]}
                </div>
              )}
            </div>
            <div>
              <p className="font-display text-xl text-[var(--navy)]">
                {preview.firstName} {preview.lastName}
              </p>
              <p className="text-sm text-[var(--muted)]">{preview.university}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-[var(--paper)] p-3">
              <dt className="text-[11px] uppercase tracking-wider text-[var(--muted)]">Kart</dt>
              <dd className="font-medium">
                {preview.membershipValid ? "Geçerli" : "Geçersiz"}
              </dd>
            </div>
            <div className="rounded-2xl bg-[var(--paper)] p-3">
              <dt className="text-[11px] uppercase tracking-wider text-[var(--muted)]">Bitiş</dt>
              <dd className="font-medium">{formatDate(preview.validUntil)}</dd>
            </div>
            <div className="col-span-2 rounded-2xl bg-[var(--navy)] p-3 text-[#f6e7c8]">
              <dt className="text-[11px] uppercase tracking-wider text-[#f6e7c8]/70">
                Uygulanacak indirim
              </dt>
              <dd className="font-display text-3xl">
                {preview.discountPercentage != null ? `%${preview.discountPercentage}` : "Tanımsız"}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            className="btn-gold w-full py-3.5 text-base"
            disabled={busy || !preview.membershipValid || preview.discountPercentage == null}
            onClick={() => void applyDiscount()}
          >
            İndirimi Uygula
          </button>
        </div>
      ) : null}
    </div>
  );
}
