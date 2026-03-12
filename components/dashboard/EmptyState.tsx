export default function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] px-5 py-10 text-center">
      <p className="font-display text-xl font-semibold text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
