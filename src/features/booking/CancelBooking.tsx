"use client";

import { useState } from "react";
import { CalendarX, Loader2 } from "lucide-react";

export function CancelBooking({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const cancel = async () => {
    setStatus("loading");
    setMessage("");
    const response = await fetch("/api/cancel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error?.message ?? "Could not cancel this booking.");
      return;
    }
    setStatus("done");
    setMessage("Canceled. The calendar event has been removed.");
  };

  return (
    <main className="cancel-shell">
      <section className="cancel-panel">
        <CalendarX size={30} aria-hidden="true" />
        <h1>Cancel booking</h1>
        <p className="muted">This will remove the Google Calendar event for both sides.</p>
        <button type="button" onClick={cancel} disabled={status === "loading" || status === "done"}>
          {status === "loading" ? <Loader2 size={18} className="spin" aria-hidden="true" /> : null}
          {status === "done" ? "Canceled" : "Cancel booking"}
        </button>
        {message ? <p className={status === "error" ? "error-text" : "success-text"}>{message}</p> : null}
      </section>
    </main>
  );
}

