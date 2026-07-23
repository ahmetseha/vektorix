import type { Metadata } from "next";
import { ActiveFieldHome } from "@/features/field/components/ActiveFieldHome";

export const metadata: Metadata = {
  title: "Your Field",
  description: "Follow the current state and memories of your active Vektor.",
};

export default function FieldPage() {
  return <ActiveFieldHome />;
}
