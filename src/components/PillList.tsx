type PillListProps = {
  items: string[]
}

export function PillList({ items }: PillListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span className="rounded-md bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300" key={item}>
          {item}
        </span>
      ))}
    </div>
  )
}
