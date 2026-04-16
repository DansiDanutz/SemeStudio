import { Navbar } from "@/components/marketing/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-7 rounded-lg bg-[#FF0000] flex items-center justify-center">
                  <span className="text-white font-black text-xs">S</span>
                </div>
                <span className="font-bold text-[#FAFAFA]">SemeStudio</span>
              </div>
              <p className="text-sm text-[#52525B] leading-relaxed">
                The AI-powered YouTube studio for creators who want to grow faster.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FAFAFA] mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-[#52525B]">
                <li><a href="#features" className="hover:text-[#A1A1AA] transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-[#A1A1AA] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#A1A1AA] transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-[#A1A1AA] transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FAFAFA] mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-[#52525B]">
                <li><a href="#" className="hover:text-[#A1A1AA] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#A1A1AA] transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-[#A1A1AA] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#A1A1AA] transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FAFAFA] mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-[#52525B]">
                <li><a href="#" className="hover:text-[#A1A1AA] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#A1A1AA] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#A1A1AA] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#A1A1AA] transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1a1a1a] pt-6 text-center text-xs text-[#52525B]">
            &copy; {new Date().getFullYear()} SemeStudio. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
