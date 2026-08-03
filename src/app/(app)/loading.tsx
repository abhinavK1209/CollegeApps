/** Mirrors the real layout's rhythm so the swap doesn't jump. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-6 py-8">
      <div className="bg-surface-raised mb-2 h-9 w-56 rounded-[10px]" />
      <div className="bg-surface-raised mb-7 h-5 w-80 rounded-[8px]" />
      <div className="bg-surface-raised mb-6 h-[104px] rounded-[14px]" />
      <div className="space-y-2">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="bg-surface-raised h-14 rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}
