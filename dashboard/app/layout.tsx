import "./globals.css";
import { Public_Sans, JetBrains_Mono } from "next/font/google";

const publicSans = Public_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-public-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains-mono" });

export const metadata = {
  title: "DR & Incident Command",
  description: "Live incidents, alert source health, and ack/resolve/escalate actions",
};

const RailItem = ({ active, label, href, icon }: { active?: boolean; label: string; href: string; icon: React.ReactNode }) => (
  <a
    href={href}
    title={label}
    className={`rail-item ${active ? "active" : ""}`}
    aria-label={label}
  >
    {icon}
  </a>
);

const ICONS: Record<string, React.ReactNode> = {
  overview: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" /></svg>,
  incidents: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  sources: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 002 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>,
  runbooks: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${publicSans.variable} ${jetbrainsMono.variable} antialiased selection:bg-[#4a8ad6] selection:text-white`}>
        <nav className="shell-rail" aria-label="Main navigation">
          <div className="rail-mark">
            <span className="text-[12px] font-700 text-[#ffffff] tracking-[-0.02em]">DC</span>
          </div>
          <div className="rail-nav">
            <RailItem active label="Overview" href="/" icon={ICONS.overview} />
            <RailItem label="Incidents" href="/incidents" icon={ICONS.incidents} />
            <RailItem label="Sources" href="/sources" icon={ICONS.sources} />
            <RailItem label="Runbooks" href="/runbooks" icon={ICONS.runbooks} />
          </div>
          <div className="rail-utils">
            <RailItem label="Settings" href="/settings" icon={ICONS.runbooks} />
          </div>
        </nav>
        <main className="shell-content">{children}</main>
      </body>
    </html>
  );
}
