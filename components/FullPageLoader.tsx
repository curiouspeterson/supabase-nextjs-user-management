export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
} 