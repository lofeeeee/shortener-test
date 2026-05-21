const steps = [
  {
    step: "01",
    title: "Register & get your token",
    description:
      "POST to `/api/auth/register` with your username, email, and password. You'll receive a Sanctum Bearer token immediately — no email verification needed.",
    code: `POST /api/auth/register
{ "username": "you", "email": "...", "password": "..." }
→ { "token": "1|abc..." }`,
  },
  {
    step: "02",
    title: "Create your first short link",
    description:
      "POST to `/api/links` with the target URL. Optionally set `valid_until` for expiring links. You'll get back an 8-char `short_url` ready to share.",
    code: `POST /api/links
Authorization: Bearer 1|abc...
{ "link_target": "https://your-long-url.com" }
→ { "short_url": "http://localhost:8000/k3xp91mz" }`,
  },
  {
    step: "03",
    title: "Track clicks & manage links",
    description:
      "Every redirect increments the `passed` counter atomically. Use GET `/api/links` to list, filter, and paginate your links. Update or deactivate anytime.",
    code: `GET /api/links?per_page=10
→ { "data": [...], "meta": { "total": 42 } }

GET /api/links/{hashedId}
→ { "data": { "passed": 17, "is_expired": false } }`,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-teal-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-900">
            Up and running in minutes
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="flex flex-col gap-4">
              {/* Step number */}
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-teal-200">
                  {s.step}
                </span>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block flex-1 h-px bg-teal-200" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-teal-900">{s.title}</h3>
              <p className="text-sm text-teal-800/60 leading-relaxed">
                {s.description}
              </p>

              {/* Code block */}
              <div className="mt-auto rounded-lg bg-teal-900 text-teal-100 font-mono text-xs p-4 leading-relaxed overflow-x-auto">
                <pre><code>{s.code}</code></pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
