"use client";

import { useState } from "react";
import { submitApplicationAction } from "@/app/actions/admin";

const UNIVERSITIES = [
  "Ankara Üniversitesi",
  "Hacettepe Üniversitesi",
  "Orta Doğu Teknik Üniversitesi",
  "Gazi Üniversitesi",
  "Bilkent Üniversitesi",
  "Ankara Yıldırım Beyazıt Üniversitesi",
  "Ankara Sosyal Bilimler Üniversitesi",
];

export function ApplicationForm() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="card space-y-4 p-5"
      action={async (fd) => {
        const res = await submitApplicationAction(fd);
        setMessage(res.message ?? null);
      }}
    >
      <h2 className="font-display text-xl text-[var(--navy)]">Öğrenci başvurusu</h2>
      <div>
        <label className="label">Üniversite</label>
        <select className="select" name="university" required defaultValue="">
          <option value="" disabled>
            Seçin
          </option>
          {UNIVERSITIES.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Öğrenci numarası</label>
        <input className="input" name="studentNumber" required />
      </div>
      <div>
        <label className="label">Bölüm</label>
        <input className="input" name="department" required />
      </div>
      <div>
        <label className="label">Öğrenci belgesi (PDF / görsel)</label>
        <input className="input" name="document" type="file" accept=".pdf,image/*" />
        <p className="mt-1 text-xs text-[var(--muted)]">
          Belgeler özel depolamada tutulur; işletmeler bu dosyayı göremez.
        </p>
      </div>
      {message ? <p className="text-sm">{message}</p> : null}
      <button className="btn-primary" type="submit">
        Başvuruyu gönder
      </button>
    </form>
  );
}
