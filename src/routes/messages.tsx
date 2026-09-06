import { createFileRoute } from "@tanstack/react-router";
import { MessagesPage } from "@/components/messages-page";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
  head: () => ({
    meta: [{ title: "Messages · Zaylist" }],
  }),
});
