// Set chico de íconos de línea, propios y sin dependencias. Todos
// aceptan className y heredan color por currentColor.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconSearch(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconCart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.8h8.2a2 2 0 0 0 2-1.6L21 8H6" />
    </svg>
  );
}

type WhatsAppIconProps = IconProps & {
  // Color del "agujero" del auricular — tiene que ser el color de lo
  // que está DETRÁS del ícono para que lea como un hueco recortado, no
  // como una mancha. Por defecto el fondo oscuro del sitio; los botones
  // sólidos verdes (bg-whatsapp) lo pisan con esa misma variable.
  cutoutColor?: string;
};

// Glyph propio (burbuja + auricular), no un asset de terceros: el
// "agujero" del auricular es la unión de varios círculos superpuestos
// sobre la burbuja sólida, ahusados en las puntas. Ver el prototipo
// verificado en la conversación antes de tocar los números — a ojo son
// fáciles de romper.
export function IconWhatsApp({
  cutoutColor = "var(--color-surface)",
  ...props
}: WhatsAppIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.07-1.38A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
      <g fill={cutoutColor}>
        <circle cx="7.3" cy="8.2" r="1.65" />
        <circle cx="7.59" cy="9.06" r="1.48" />
        <circle cx="7.93" cy="9.87" r="1.32" />
        <circle cx="8.3" cy="10.63" r="1.18" />
        <circle cx="8.71" cy="11.34" r="1.05" />
        <circle cx="9.16" cy="11.99" r="0.94" />
        <circle cx="9.65" cy="12.6" r="0.86" />
        <circle cx="10.18" cy="13.15" r="0.82" />
        <circle cx="10.75" cy="13.65" r="0.8" />
        <circle cx="11.36" cy="14.1" r="0.82" />
        <circle cx="12" cy="14.5" r="0.86" />
        <circle cx="12.69" cy="14.84" r="0.94" />
        <circle cx="13.41" cy="15.14" r="1.05" />
        <circle cx="14.18" cy="15.38" r="1.18" />
        <circle cx="14.98" cy="15.57" r="1.32" />
        <circle cx="15.82" cy="15.71" r="1.48" />
        <circle cx="16.7" cy="15.8" r="1.65" />
      </g>
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconArrowLeft(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

export function IconArrowDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M18 13l-6 6-6-6" />
    </svg>
  );
}

export function IconStar(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.6l-6.1 3.4 1.5-6.8-5.2-4.7 6.9-.7z" />
    </svg>
  );
}

export function IconTruck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2 8h11v8H2zM13 11h4l3 3v2h-7z" />
      <circle cx="6.5" cy="18.5" r="1.75" />
      <circle cx="16.5" cy="18.5" r="1.75" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5l7.5 3v6c0 5-3.2 8.4-7.5 10-4.3-1.6-7.5-5-7.5-10v-6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconHeadset(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
      <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
      <path d="M19.5 19v.5a3.5 3.5 0 0 1-3.5 3.5h-3" />
    </svg>
  );
}

export function IconRuler(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="7" width="19" height="10" rx="1.5" transform="rotate(0 12 12)" />
      <path d="M6 7v3M10 7v3M14 7v3M18 7v3" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconShare(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8 15.8 6.2M8.2 13.2l7.6 4.6" />
    </svg>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.3a3.2 3.2 0 0 1 0 6.1M18.5 20a6.2 6.2 0 0 0-4-5.8" />
    </svg>
  );
}
