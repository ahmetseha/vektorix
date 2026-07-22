import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <div className="space-y-6 p-8"><Skeleton className="h-10 w-64" /><div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div><Skeleton className="h-96" /></div>; }
