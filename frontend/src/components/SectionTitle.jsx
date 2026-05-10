import { motion } from "framer-motion";

export default function SectionTitle({ eyebrow, title, body }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-clay">{eyebrow}</p>}
      <h2 className="font-display text-3xl font-bold leading-tight sm:text-5xl">{title}</h2>
      {body && <p className="mt-4 text-base leading-7 text-ink/65 dark:text-vellum/65">{body}</p>}
    </motion.div>
  );
}
