export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 bg-muted rounded-xl w-48" />
        <div className="h-10 bg-muted rounded-xl w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[180px] bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
