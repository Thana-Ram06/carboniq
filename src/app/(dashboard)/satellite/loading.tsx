export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-8 bg-muted rounded-xl w-60 mb-8" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 h-[480px] bg-muted rounded-2xl" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
