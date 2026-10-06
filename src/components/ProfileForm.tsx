"use client";

import { useState } from "react";
import { updateProfileAction } from "@/app/actions/admin";

export function ProfileForm({
  firstName,
  lastName,
  email,
  phone,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}) {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="card max-w-lg space-y-4 p-5"
      action={async (fd) => {
        const res = await updateProfileAction(fd);
        setMessage(res.message ?? null);
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Ad</label>
          <input className="input" name="firstName" defaultValue={firstName} required />
        </div>
        <div>
          <label className="label">Soyad</label>
          <input className="input" name="lastName" defaultValue={lastName} required />
        </div>
      </div>
      <div>
        <label className="label">E-posta</label>
        <input className="input" value={email} disabled />
      </div>
      <div>
        <label className="label">Telefon</label>
        <input className="input" name="phone" defaultValue={phone ?? ""} />
      </div>
      {message ? <p className="text-sm">{message}</p> : null}
      <button className="btn-primary" type="submit">
        Kaydet
      </button>
    </form>
  );
}
