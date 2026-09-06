import { createRoot } from "react-dom/client";
import { LivingMap } from "@/components/living-map";
import arterials from "../public/pdx-arterials.json";
import "leaflet/dist/leaflet.css";
import "../src/styles.css";

(globalThis as { __PDX_ARTERIALS__?: unknown }).__PDX_ARTERIALS__ = arterials;

const root = document.getElementById("root");
if (!root) throw new Error("missing #root");
createRoot(root).render(<LivingMap />);
