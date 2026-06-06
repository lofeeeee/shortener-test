import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What authentication method does the API use?",
    a: "Laravel Sanctum Bearer tokens. After registering or logging in, you receive a personal access token. Include it as `Authorization: Bearer <token>` on every protected request. Tokens are revoked on logout.",
  },
  {
    q: "Can links expire automatically?",
    a: "Yes. Set `valid_until` to any future ISO-8601 datetime when creating or updating a link. When a visitor hits the short URL after that time, the redirect returns 410 Gone. Leave `valid_until` as null for permanent links.",
  },
  {
    q: "How are database IDs protected in the API?",
    a: "All integer IDs are encoded with HashIDs using a secret key stored in your `.env` (`HASHIDS_SECRET`). The raw DB ID is never exposed. Each encoded ID is 8 characters by default (`HASHIDS_LENGTH`).",
  },
  {
    q: "Are deleted links permanently removed?",
    a: "No. Deletion is soft — `is_active` is set to false and `deleted_at` / `deleted_by` are recorded. The link data is preserved for auditing. You can include soft-deleted links in list responses with `?include_deleted=true`.",
  },
  {
    q: "What database does it require?",
    a: "PostgreSQL. The schema uses standard `bigint` primary keys, foreign keys, and timestamps. Configure connection details in your `.env` (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).",
  },
  {
    q: "Can I change a link's short code after creation?",
    a: "Short codes (`unique_id`) are generated once at creation and are immutable. However, you can update the target URL (`link_target`) and expiry (`valid_until`) at any time via PATCH `/api/links/{id}`.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 px-4 sm:px-6 bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-900 dark:text-gray-100">
            Common questions
          </h2>
        </div>

        <Accordion multiple={false} className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-teal-100 dark:border-gray-800 rounded-lg px-5 data-[state=open]:border-teal-300 dark:data-[state=open]:border-teal-800 data-[state=open]:bg-teal-50/60 dark:data-[state=open]:bg-teal-950/40 transition-all duration-150"
            >
              <AccordionTrigger className="text-left text-sm font-medium text-teal-900 dark:text-gray-100 hover:no-underline py-4 cursor-pointer">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-teal-800/65 dark:text-gray-400 leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
