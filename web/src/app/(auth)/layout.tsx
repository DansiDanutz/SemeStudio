import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a0a] items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FF0000]/[0.04] rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#7C3AED]/[0.03] rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 rounded-xl bg-[#FF0000] flex items-center justify-center">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-[#FAFAFA]">SemeStudio</span>
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-[#FAFAFA] mb-4 leading-tight">
            Create YouTube content
            <br />
            <span className="text-gradient-hero">10x faster</span>
          </h1>
          <p className="text-[#A1A1AA] text-lg leading-relaxed">
            Research, script, thumbnail, optimize, upload — all powered by AI.
          </p>
          <div className="mt-12 space-y-4">
            {[
              "10,000+ creators trust SemeStudio",
              "500M+ views generated",
              "No credit card required",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-sm text-[#52525B]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
