import { SiteHeader } from "@/components/layout/SiteHeader";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) { const { username } = await params; return <><SiteHeader /><main id="main-content" className="simple-page"><p className="eyebrow">RESEARCHER PROFILE</p><h1>@{username}</h1><p>Public profiles activate when a persistent account provider and PostgreSQL connection are configured.</p><a href="/explore">Return to the field</a></main></>; }
