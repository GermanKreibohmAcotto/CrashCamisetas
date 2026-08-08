import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { IconHeadset, IconShield, IconTruck } from "@/components/icons";

const FEATURES = [
  {
    icon: IconShield,
    title: "Calidad Premium",
    description:
      "Telas de alta tecnología, costuras reforzadas y detalles fieles a los originales.",
    color: "text-primary",
    glow: "group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(151,204,254,0.3)]",
  },
  {
    icon: IconTruck,
    title: "Envío Nacional",
    description: "Despachamos a todo el país. Coordinamos la entrega por WhatsApp.",
    color: "text-secondary",
    glow: "group-hover:border-secondary group-hover:shadow-[0_0_15px_rgba(255,183,125,0.3)]",
  },
  {
    icon: IconHeadset,
    title: "Atención 24/7",
    description:
      "Resolvemos tus dudas al instante por WhatsApp. Asesoramiento personalizado.",
    color: "text-whatsapp",
    glow: "group-hover:border-whatsapp group-hover:shadow-[0_0_15px_rgba(37,211,102,0.3)]",
  },
];

export function FeaturesBanner() {
  return (
    <section className="relative overflow-hidden border-y border-outline-variant/30 bg-surface py-16">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #97ccfe 0, #97ccfe 2px, transparent 2px, transparent 10px)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <Stagger className="grid grid-cols-1 gap-8 divide-y divide-outline-variant/30 md:grid-cols-3 md:divide-x md:divide-y-0">
          {FEATURES.map((feature) => (
            <StaggerItem
              key={feature.title}
              className="group flex flex-col items-center p-6 text-center"
            >
              <div
                className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-outline bg-surface-container-high transition-all ${feature.glow}`}
              >
                <feature.icon
                  className={`h-8 w-8 ${feature.color} transition-transform group-hover:scale-110`}
                />
              </div>
              <h3 className="mb-2 font-display uppercase text-on-surface">
                {feature.title}
              </h3>
              <p className="font-body text-sm text-on-surface-variant">
                {feature.description}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
