import type { Metadata } from "next";
import { LabExperience } from "@/features/lab/components/LabExperience";

export const metadata: Metadata = { title: "Lab", description: "Shape a deterministic digital organism through motion, energy and sound." };
export default function LabPage() { return <LabExperience />; }
