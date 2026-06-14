export default function ReunitedImageStamp() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div className="w-[150%] -rotate-12 border-y-2 border-rose-300/80 bg-rose-100/85 py-3 text-center shadow-lg backdrop-blur-[1px]">
        <span className="text-3xl font-black uppercase tracking-[0.35em] text-rose-500/90 sm:text-4xl">
          Reunido
        </span>
      </div>
    </div>
  );
}
