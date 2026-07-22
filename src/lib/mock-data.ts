import type { KpiMetric, SalesDataPoint, Transaction } from "@/types";

export const kpiMetrics: KpiMetric[] = [
  { title: "Total Revenue", value: "$20,320", change: 0.94, description: "vs. previous month", data: [16, 22, 18, 28, 25, 34, 31, 42, 38, 48, 44, 56] },
  { title: "Total Orders", value: "10,320", change: 0.91, description: "vs. previous month", data: [19, 17, 23, 20, 29, 26, 32, 34, 31, 39, 36, 43] },
  { title: "New Customers", value: "4,305", change: 0.94, description: "vs. previous month", data: [12, 18, 15, 21, 19, 28, 24, 31, 29, 38, 34, 42] },
];

export const weeklySales: SalesDataPoint[] = [
  { label: "Mon", newUser: 3200, existingUser: 5100 },
  { label: "Tue", newUser: 4100, existingUser: 6200 },
  { label: "Wed", newUser: 3600, existingUser: 5800 },
  { label: "Thu", newUser: 5200, existingUser: 7100 },
  { label: "Fri", newUser: 6100, existingUser: 8200 },
  { label: "Sat", newUser: 4800, existingUser: 6900 },
  { label: "Sun", newUser: 5500, existingUser: 7600 },
];

export const monthlySales: SalesDataPoint[] = [
  { label: "Jan", newUser: 7800, existingUser: 11200 },
  { label: "Feb", newUser: 9200, existingUser: 13800 },
  { label: "Mar", newUser: 8500, existingUser: 12400 },
  { label: "Apr", newUser: 11100, existingUser: 15800 },
  { label: "May", newUser: 10800, existingUser: 14600 },
  { label: "Jun", newUser: 13600, existingUser: 18100 },
  { label: "Jul", newUser: 12800, existingUser: 17200 },
  { label: "Aug", newUser: 14900, existingUser: 19800 },
  { label: "Sep", newUser: 13100, existingUser: 17900 },
  { label: "Oct", newUser: 15700, existingUser: 21200 },
  { label: "Nov", newUser: 16600, existingUser: 22500 },
  { label: "Dec", newUser: 18200, existingUser: 24800 },
];

export const yearlySales: SalesDataPoint[] = [
  { label: "2022", newUser: 84000, existingUser: 128000 },
  { label: "2023", newUser: 112000, existingUser: 166000 },
  { label: "2024", newUser: 148000, existingUser: 218000 },
  { label: "2025", newUser: 181000, existingUser: 267000 },
  { label: "2026", newUser: 216000, existingUser: 318000 },
];

export const chartData = { weekly: weeklySales, monthly: monthlySales, yearly: yearlySales };

export const transactions: Transaction[] = [
  { id: "#VX-9842", customer: "Olivia Martin", email: "olivia@northstar.co", amount: 1840, status: "Completed", channel: "Shopify", initials: "OM" },
  { id: "#VX-9841", customer: "Liam Chen", email: "liam@atlaslabs.io", amount: 1260, status: "Completed", channel: "WooCommerce", initials: "LC" },
  { id: "#VX-9840", customer: "Emma Wilson", email: "emma@studioform.co", amount: 980, status: "Pending", channel: "Shopify", initials: "EW" },
  { id: "#VX-9839", customer: "Noah Williams", email: "noah@grounded.com", amount: 760, status: "Completed", channel: "Amazon", initials: "NW" },
  { id: "#VX-9838", customer: "Sophia Brown", email: "sophia@kindred.co", amount: 520, status: "Refunded", channel: "Shopify", initials: "SB" },
];
