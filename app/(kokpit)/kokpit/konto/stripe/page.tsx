"use client";

import { useState } from "react";

export default function StripePage() {
  const [loading, setLoading] = useState(false);

  const connectStripe = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/connect");
    const data = await res.json();
    window.location.href = data.url; // przekierowanie do Stripe
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Połącz konto Stripe</h1>
      <button
        onClick={connectStripe}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Łączenie..." : "Połącz konto Stripe"}
      </button>
    </div>
  );
}
