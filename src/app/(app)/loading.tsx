export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-steel-blue-200 border-t-brand-indigo"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
