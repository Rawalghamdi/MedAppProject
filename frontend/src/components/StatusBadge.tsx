type Status = "pending" | "confirmed" | "completed" | "cancelled";

const styles: Record<Status, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-400",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = styles[status as Status] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {status}
    </span>
  );
}
