"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const settingsSchema = z.object({
  workspaceName: z.string().min(3, "Workspace name must be at least 3 characters"),
  email: z.email("Enter a valid email address"),
  timezone: z.string().min(1),
});

type SettingsInput = z.infer<typeof settingsSchema>;

export function SettingsForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { workspaceName: "Spark Pixel Team", email: "admin@vektorix.io", timezone: "Europe/Istanbul" },
  });
  return <form onSubmit={handleSubmit(async () => undefined)} className="space-y-5"><div><label htmlFor="workspaceName" className="mb-2 block text-sm font-medium">Workspace name</label><Input id="workspaceName" {...register("workspaceName")} aria-invalid={Boolean(errors.workspaceName)} />{errors.workspaceName && <p className="mt-1.5 text-xs text-accent-red">{errors.workspaceName.message}</p>}</div><div><label htmlFor="email" className="mb-2 block text-sm font-medium">Billing email</label><Input id="email" type="email" {...register("email")} aria-invalid={Boolean(errors.email)} />{errors.email && <p className="mt-1.5 text-xs text-accent-red">{errors.email.message}</p>}</div><div><label htmlFor="timezone" className="mb-2 block text-sm font-medium">Timezone</label><Input id="timezone" {...register("timezone")} /></div><div className="flex items-center gap-3 border-t border-surface-border pt-5"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save changes"}</Button>{isSubmitSuccessful && <span role="status" className="text-sm text-emerald-700">Changes saved.</span>}</div></form>;
}
