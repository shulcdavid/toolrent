export default function ListingLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <div className="h-5 w-20 rounded-lg bg-gray-200 animate-pulse mb-6" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="h-96 rounded-2xl bg-gray-200 animate-pulse" />
          <div className="flex flex-col gap-3">
            <div className="h-8 w-2/3 rounded-xl bg-gray-200 animate-pulse" />
            <div className="h-5 w-1/3 rounded-lg bg-gray-100 animate-pulse" />
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="h-5 w-24 rounded-lg bg-gray-200 animate-pulse mb-3" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 rounded-lg bg-gray-100 animate-pulse mb-2" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="h-6 w-32 rounded-lg bg-gray-200 animate-pulse mb-4" />
            <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
