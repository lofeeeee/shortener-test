import {
  Link2,
  BarChart3,
  Clock,
  Trash2,
  ShieldCheck,
  ListFilter,
} from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Link Shortening",
    description:
      "Generate 7-character unique short codes via cryptographically random selection. Collision-checked on every creation.",
  },
  {
    icon: BarChart3,
    title: "Click Analytics",
    description:
      "Every redirect atomically increments the click counter. See how many times each link was visited with the `passed` field.",
  },
  {
    icon: Clock,
    title: "Link Expiry",
    description:
      "Set a `valid_until` timestamp per link. Expired links return 410 Gone. Leave it null for permanent links.",
  },
  {
    icon: Trash2,
    title: "Soft Delete",
    description:
      "Links are never hard-deleted. Deactivating sets `is_active=false` and records `deleted_at` + `deleted_by` for auditability.",
  },
  {
    icon: ShieldCheck,
    title: "Sanctum Auth",
    description:
      "Every write endpoint is protected by Laravel Sanctum Bearer tokens. Register, login, and manage your tokens via the API.",
  },
  {
    icon: ListFilter,
    title: "Filtered Pagination",
    description:
      "List your links with `?include_deleted` and `?include_expired` query params. Paginate with `per_page` for full control.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-900 dark:text-gray-100">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="mt-4 text-teal-800/60 dark:text-gray-400 max-w-xl mx-auto">
            Built as a pure REST API — integrate it into any stack, any
            platform, any project.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-xl border border-teal-100 dark:border-gray-800 bg-teal-50/40 dark:bg-gray-900/40 hover:border-teal-300 dark:hover:border-teal-800 hover:bg-teal-50 dark:hover:bg-gray-900 transition-all duration-150"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/40 mb-4 group-hover:bg-teal-200 dark:group-hover:bg-teal-900 transition-colors duration-150">
                <f.icon className="w-5 h-5 text-teal-700 dark:text-teal-400" strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold text-teal-900 dark:text-gray-100 mb-2">{f.title}</h3>
              <p className="text-sm text-teal-800/60 dark:text-gray-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
