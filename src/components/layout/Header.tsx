interface HeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export default function Header({ title, description, action }: HeaderProps) {
  return (
    <div className="flex items-center justify-between pb-6 border-b border-gray-800 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
