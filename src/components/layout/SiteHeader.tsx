import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Vektorix home">VEKTORIX</Link>
      <nav aria-label="Main navigation"><Link href="/lab">Lab</Link><Link href="/explore">Explore</Link><Link href="/settings">Settings</Link></nav>
    </header>
  );
}
