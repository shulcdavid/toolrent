export default function ListingsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="h-8 w-48 rounded-xl bg-gray-200 animate-pulse mb-6" />
      <div className="flex gap-8">
        <div className="hidden lg:flex flex-col gap-4 w-56 shrink-0">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 flex flex-col gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-6 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-5 rounded-lg bg-gray-200 animate-pulse w-3/4" />
                <div className="h-4 rounded-lg bg-gray-100 animate-pulse w-1/2" />
                <div className="h-6 rounded-lg bg-gray-200 animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
