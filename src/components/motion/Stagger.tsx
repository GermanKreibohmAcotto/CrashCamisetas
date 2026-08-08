"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

type StaggerProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
};

// Contenedor que escalona la entrada de sus hijos <StaggerItem>. Pensado
// para grillas de productos: cada tarjeta aparece un poco después que
// la anterior en vez de todas juntas.
export function Stagger({ children, className, staggerDelay = 0.08 }: StaggerProps) {
  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduceMotion ? 0 : staggerDelay },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={container}
    >
      {children}
    </motion.div>
  );
}

// Hijo de <Stagger>. Sin variants propios no anima nada por sí solo:
// hereda "hidden"/"visible" del contenedor padre.
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
