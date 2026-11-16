// Full-section loading screen: the looping Uplink logo.
// It fades in after a short delay, so fast loads never flash it.
export function LogoLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="uplink-loader flex min-h-[55vh] items-center justify-center"
    >
      <style>{`
.uplink-loader{animation:uplink-loader-in .25s ease-out .4s both}
@keyframes uplink-loader-in{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.uplink-loader{animation:none}}
`}</style>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/uplink-loader.svg"
        alt=""
        width={561}
        height={148}
        className="h-auto w-56 md:w-72"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
