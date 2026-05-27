import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="dark:bg-white dark:rounded-xl dark:px-3 dark:py-2">
          <Image
            src="/images/vasudha-logo.png"
            alt="VASUDHA"
            width={180}
            height={60}
            className="object-contain h-12 w-auto animate-pulse"
            priority
          />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
