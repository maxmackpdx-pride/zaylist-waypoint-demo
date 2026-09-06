import { createFileRoute } from "@tanstack/react-router";
import { LivingMap } from "@/components/living-map";

export const Route = createFileRoute("/")({ component: LivingMap });
