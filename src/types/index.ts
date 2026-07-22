export type TrendDirection = "up" | "down";

export interface KpiMetric {
  title: string;
  value: string;
  change: number;
  description: string;
  data: number[];
}

export interface SalesDataPoint {
  label: string;
  newUser: number;
  existingUser: number;
}

export type ChartRange = "weekly" | "monthly" | "yearly";

export interface Transaction {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: "Completed" | "Pending" | "Refunded";
  channel: string;
  initials: string;
}

export interface AnalyticsResponse {
  summary: {
    revenue: number;
    orders: number;
    newCustomers: number;
  };
  trend: SalesDataPoint[];
  cached: boolean;
}
