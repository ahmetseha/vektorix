import { SiteHeader } from "@/components/layout/SiteHeader";

export default function SettingsPage() { return <><SiteHeader /><main id="main-content" className="simple-page"><p className="eyebrow">LOCAL SETTINGS</p><h1>Your field,<br />your device.</h1><p>Motion preferences follow your operating system. Microphone analysis is opt-in, local-only, and ends when you leave the lab.</p><dl><div><dt>Motion</dt><dd>System preference</dd></div><div><dt>Audio storage</dt><dd>Never stored</dd></div><div><dt>Draft recovery</dt><dd>Local browser only</dd></div></dl></main></>; }
