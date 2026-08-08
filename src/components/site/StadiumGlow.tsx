import Image from "next/image";

// Capa decorativa fija detrás de todo el contenido: los "reflectores de
// estadio" y los assets de Crash flotando con opacidad baja. Server
// Component puro — sin JS de por medio, las animaciones son CSS
// (motion-safe: no corre nada si el visitante pidió reducir movimiento).
export function StadiumGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="motion-safe:animate-pulse absolute left-[10%] top-[15%] h-[300px] w-[300px] rounded-full bg-primary/20 blur-[100px] [animation-duration:4s]" />
      <div className="motion-safe:animate-pulse absolute bottom-[15%] right-[10%] h-[400px] w-[400px] rounded-full bg-primary/15 blur-[120px] [animation-duration:6s] [animation-delay:1s]" />

      <div className="motion-safe:animate-pulse absolute left-[15%] top-1/4 opacity-10">
        <Image
          src="/crate.png"
          alt=""
          width={64}
          height={64}
          className="h-[64px] w-[64px] rotate-12"
        />
      </div>
      <div className="motion-safe:animate-pulse absolute bottom-1/3 right-[10%] opacity-10 [animation-delay:700ms]">
        <Image
          src="/wumpa.png"
          alt=""
          width={72}
          height={72}
          className="h-[72px] w-[72px] -rotate-12"
        />
      </div>
    </div>
  );
}
