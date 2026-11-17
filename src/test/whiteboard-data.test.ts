import { describe, expect, it } from "vitest";

import { deriveChartData } from "@/lib/whiteboard-data";

describe("whiteboard chart data", () => {
  it("reflects edited table values in the chart data", () => {
    const editedRows = [
      { name: "An", score: "9" },
      { name: "Bình", score: "8.5" },
    ];

    expect(deriveChartData(editedRows, "name", "score")).toEqual([
      { label: "An", value: 9 },
      { label: "Bình", value: 8.5 },
    ]);
  });
});