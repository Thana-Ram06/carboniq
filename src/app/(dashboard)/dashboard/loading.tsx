export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <div className="h-7 bg-muted rounded-xl w-56" />
          <div className="h-4 bg-muted rounded-xl w-40" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-muted rounded-xl w-28" />
          <div className="h-9 bg-muted rounded-xl w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-muted rounded-2xl" />
        <div className="h-72 bg-muted rounded-2xl" />
      </div>
    </div>
  );
}
