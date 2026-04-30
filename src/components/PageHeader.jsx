export default function PageHeader({ icon, title, subtitle }) {
  return (
    <div className="w-full py-8 px-4 text-center text-white" style={{ backgroundColor: '#F05A14' }}>
      {icon && (
        <div className="flex justify-center mb-3 text-white opacity-90 text-4xl">
          {icon}
        </div>
      )}
      <h1 className="text-xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-sm text-white/90 mt-1">{subtitle}</p>}
    </div>
  )
}
