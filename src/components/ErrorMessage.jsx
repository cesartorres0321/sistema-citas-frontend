export default function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  )
}
