"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "default" });

export function MermaidChart({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      // Clear previous render
      ref.current.innerHTML = "";

      // Unique ID to force Mermaid to re-render
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

      try {
        mermaid.render(id, chart).then(({ svg }) => {
          if (ref.current) ref.current.innerHTML = svg;
        });
      } catch (err) {
        console.error("Mermaid render error:", err);
      }
    }
  }, [chart]);

  return <div ref={ref} />;
}
