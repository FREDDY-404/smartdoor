export default function SectionCard({
  title,
  description,
  action,
  children
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-6 shadow-glow">
      <div className="flex flex-col gap-3 border-b border-white/8 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="font-display text-[1.65rem] font-semibold text-white">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
