export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-8 bg-muted rounded-xl w-56 mb-8" />
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 h-[600px] bg-muted rounded-2xl" />
        <div className="col-span-3 h-[300px] bg-muted rounded-2xl" />
      </div>
    </div>
  );
}
