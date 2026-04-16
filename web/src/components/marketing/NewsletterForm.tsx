"use client";

export function NewsletterForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex gap-2"
      aria-label="Newsletter signup"
    >
      <input
        type="email"
        placeholder="your@email.com"
        className="flex-1 min-w-0 rounded-lg border border-[#222] bg-[#111111] px-3 py-2 text-xs text-[#FAFAFA] placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#FF0000]/40 transition-colors"
        aria-label="Email address for newsletter"
      />
      <button
        type="submit"
        className="rounded-lg bg-[#FF0000] hover:bg-[#CC0000] px-3 py-2 text-xs font-semibold text-white transition-colors shrink-0"
      >
        Subscribe
      </button>
    </form>
  );
}
