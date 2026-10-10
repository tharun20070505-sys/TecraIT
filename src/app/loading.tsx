export default function Loading() {
  return (
    <div
      className="min-h-[70vh] bg-ivory px-5 py-12 sm:px-8"
      role="status"
      aria-label="Loading page content"
      aria-busy="true"
    >
      <div className="mx-auto w-full max-w-7xl space-y-10">
        <div className="h-56 rounded-[3px] border border-sand/40 bg-midnight" />
        <div className="space-y-4">
          <div className="h-3 w-40 rounded-sm bg-sand" />
          <div className="h-10 w-3/4 max-w-2xl rounded-sm bg-sand" />
          <div className="h-4 w-full max-w-3xl rounded-sm bg-sand/70" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-56 rounded-[3px] border border-sand/50 bg-white" />
          <div className="h-56 rounded-[3px] border border-sand/50 bg-white" />
          <div className="h-56 rounded-[3px] border border-sand/50 bg-white" />
        </div>
      </div>
    </div>
  );
}
