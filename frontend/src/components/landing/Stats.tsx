const stats = [
  { value: "8-char", label: "HashID-encoded short codes" },
  { value: "API-First", label: "REST interface, no UI required" },
  { value: "Argon2id", label: "Password hashing standard" },
  { value: "Sanctum", label: "Token-based auth out of the box" },
];

export default function Stats() {
  return (
    <section className="bg-teal-600 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.value} className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">{s.value}</p>
            <p className="mt-1 text-sm text-teal-100/80">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
