import { createFileRoute } from "@tanstack/react-router";
import { AlertsPage } from "@/components/alerts-page";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
  head: () => ({
    meta: [{ title: "Alerts · Zaylist" }],
  }),
});
