export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="space-y-6">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-center">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 