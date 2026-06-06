import { notFound } from "next/navigation";
import { Link2, MousePointerClick, ExternalLink } from "lucide-react";
import type { BioData } from "@/lib/api";
import Link from "next/link";

const BACKEND = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

async function getBio(username: string): Promise<BioData | null> {
  try {
    const res = await fetch(`${BACKEND}/api/users/${username}/bio`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as BioData;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return { title: `@${username} — LinkShort` };
}

export default async function BioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const bio = await getBio(username);

  if (!bio) notFound();

  return (
    <div className="min-h-dvh bg-teal-50 dark:bg-gray-950 flex flex-col items-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10 text-teal-700 dark:text-teal-400 font-semibold text-lg">
        <span className="flex items-center justify-center w-8 h-8 bg-teal-600 rounded-lg">
          <Link2 className="w-4 h-4 text-white" strokeWidth={2.5} />
        </span>
        LinkShort
      </Link>

      <div className="w-full max-w-md">
        {/* Profile card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-teal-100 dark:border-gray-800 shadow-sm p-6 mb-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-2xl mx-auto mb-3">
            {bio.display_name[0].toUpperCase()}
          </div>
          <h1 className="text-lg font-bold text-teal-900 dark:text-gray-100">{bio.display_name}</h1>
          <p className="text-sm text-teal-500 dark:text-teal-400">@{bio.username}</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-teal-400 dark:text-gray-500">
            <span>{bio.link_count} link{bio.link_count !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>Member since {bio.member_since}</span>
          </div>
        </div>

        {/* Links */}
        {bio.links.length === 0 ? (
          <div className="text-center py-12 text-teal-400 dark:text-teal-600">
            <Link2 className="w-8 h-8 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm">No public links yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bio.links.map((link) => (
              <a
                key={link.unique_id}
                href={link.short_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-gray-900 rounded-xl border border-teal-100 dark:border-gray-800 p-4 flex items-center justify-between hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm transition-all duration-150"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-teal-900 dark:text-gray-100 truncate">{link.title}</p>
                  <p className="text-xs text-teal-400 font-mono mt-0.5">/{link.unique_id}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="flex items-center gap-1 text-xs text-teal-400">
                    <MousePointerClick className="w-3 h-3" />
                    {link.clicks.toLocaleString()}
                  </span>
                  <ExternalLink className="w-4 h-4 text-teal-300 group-hover:text-teal-600 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-teal-400 dark:text-teal-600 mt-8">
          Powered by{" "}
          <Link href="/" className="hover:text-teal-600 transition-colors">
            LinkShort
          </Link>
        </p>
      </div>
    </div>
  );
}
