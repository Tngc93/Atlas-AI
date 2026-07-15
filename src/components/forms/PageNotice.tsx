export function PageNotice({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div role="status" aria-live="polite" className="mb-5 mt-5 rounded-xl border border-mint/25 bg-mint/10 px-4 py-3 text-sm font-semibold leading-6 text-mint">
      {message}
    </div>
  );
}
