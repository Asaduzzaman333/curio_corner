export default function PageHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.32em] text-clay">{eyebrow}</p>
        <h1 className="font-display text-4xl font-bold">{title}</h1>
      </div>
      {action}
    </div>
  );
}
