"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <h1 className="text-fg text-[20px] font-semibold">Something went wrong here.</h1>
      <p className="text-fg-muted mt-2 text-[14px]">
        Your data is safe — nothing was lost. This page just failed to load.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-accent text-accent-fg hover:bg-accent-hover mt-5 inline-flex h-9 items-center rounded-[10px] px-4 text-[13.5px] font-medium transition-colors duration-100"
      >
        Try again
      </button>
      {error.digest && (
        <p className="text-fg-subtle mt-4 font-mono text-[11px]">
          Reference {error.digest}
        </p>
      )}
    </div>
  );
}
