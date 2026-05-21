import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-teal-600">
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Ready to start shortening?
        </h2>
        <p className="text-teal-100/80 max-w-md text-base">
          Run <code className="bg-teal-700/50 px-1.5 py-0.5 rounded text-teal-100 font-mono text-sm">setup.bat</code> and
          you&apos;re live in under two minutes.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/register"
            className={cn(
              buttonVariants(),
              "bg-orange-500 hover:bg-orange-600 text-white gap-2 cursor-pointer transition-colors duration-150"
            )}
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-white/30 text-white hover:bg-white/10 hover:text-white cursor-pointer transition-colors duration-150 bg-transparent"
            )}
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
