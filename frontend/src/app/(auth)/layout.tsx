import { Link2 } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-teal-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8 text-teal-700 dark:text-teal-400 font-semibold text-lg">
        <span className="flex items-center justify-center w-8 h-8 bg-teal-600 rounded-lg">
          <Link2 className="w-4 h-4 text-white" strokeWidth={2.5} />
        </span>
        LinkShort
      </Link>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-teal-100 dark:border-gray-800 shadow-sm p-8">
        {children}
      </div>
    </div>
  );
}
