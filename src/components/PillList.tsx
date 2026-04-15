type PillListProps = {
  items: string[]
}

export function PillList({ items }: PillListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span className="rounded-md border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm shadow-sky-100/60" key={item}>
          {item}
        </span>
      ))}
    </div>
  )
}
