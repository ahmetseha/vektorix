import {
  BadgeDollarSign,
  Boxes,
  Cable,
  ChartNoAxesCombined,
  CreditCard,
  Gauge,
  ListOrdered,
  Megaphone,
  MessageSquareText,
  RadioTower,
  Settings,
  ShieldCheck,
  SquareUserRound,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigation: NavigationGroup[] = [
  {
    label: "Main menu",
    items: [
      { label: "Dashboard", href: "/", icon: Gauge },
      { label: "Products", href: "/products", icon: Boxes },
      { label: "Transactions", href: "/transactions", icon: BadgeDollarSign },
      { label: "Reports & Analytics", href: "/reports", icon: ChartNoAxesCombined },
      { label: "Messages", href: "/messages", icon: MessageSquareText, badge: "8" },
      { label: "Team Performance", href: "/team", icon: UsersRound },
      { label: "Campaigns", href: "/campaigns", icon: Megaphone },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Customer List", href: "/customers", icon: SquareUserRound },
      { label: "Channels", href: "/channels", icon: RadioTower },
      { label: "Order Management", href: "/orders", icon: ListOrdered },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Roles & Permissions", href: "/roles", icon: ShieldCheck },
      { label: "Billing & Subscription", href: "/billing", icon: CreditCard },
      { label: "Integrations", href: "/integrations", icon: Cable },
    ],
  },
  {
    label: "",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];
