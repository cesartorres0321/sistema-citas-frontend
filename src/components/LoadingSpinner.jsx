export default function LoadingSpinner({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" style={{ borderTopColor: '#F05A14' }} />
      <p className="text-sm">{message}</p>
    </div>
  )
}
