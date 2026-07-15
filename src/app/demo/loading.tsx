export default function DemoLoading() {
  return (
    <div aria-busy="true" aria-label="Loading the public demo" className="space-y-6">
      <div className="space-y-3">
        <div className="ui-skeleton h-3 w-44" />
        <div className="ui-skeleton h-10 w-full max-w-xl" />
        <div className="ui-skeleton h-5 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="ui-card space-y-4"><div className="ui-skeleton h-5 w-32" /><div className="ui-skeleton h-9 w-40" /><div className="ui-skeleton h-4 w-full" /></div>)}
      </div>
      <span className="sr-only">The fictional in-memory demo is loading. No network or database request is required.</span>
    </div>
  );
}
