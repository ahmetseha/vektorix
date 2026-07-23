"use client";

import dynamic from "next/dynamic";

export const DynamicLabCanvas = dynamic(
  () => import("./LabCanvas").then((module) => module.LabCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="canvas-loader" role="status">
        <span aria-hidden="true" />
        Initializing field…
      </div>
    ),
  },
);
