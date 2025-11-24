"use client";

import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

const stackVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.05,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function MotionStack({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={stackVariants} initial="hidden" animate="show" className={className}>
      {Array.isArray(children)
        ? children.map((child, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
