export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="w-8 h-8 border-2 border-[#0f7bb5] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
