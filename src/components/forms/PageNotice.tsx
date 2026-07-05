export function PageNotice({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div role="status" className="mb-4 rounded-md border border-mint/25 bg-mint/10 px-4 py-3 text-sm font-medium text-mint">
      {message}
    </div>
  );
}
