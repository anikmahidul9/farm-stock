export default function ProfileLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
        <p className="text-sm text-orange-600">Loading profile...</p>
      </div>
    </div>
  )
}
