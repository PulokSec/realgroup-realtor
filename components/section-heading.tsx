interface SectionHeadingProps {
  label: string
  title: string
  darkMode?: boolean
}

export function SectionHeading({ label, title, darkMode = false }: SectionHeadingProps) {
  const labelColor = darkMode ? "text-gray-400" : "text-gray-500"
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200"

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs uppercase tracking-wider ${labelColor}`}>{label}</span>
        <hr className={`flex-grow ${borderColor}`} />
      </div>
      <h2 className="text-3xl font-bold">{title}</h2>
    </div>
  )
}

