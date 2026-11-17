export type WhiteboardRow = Record<string, string>;

export type WhiteboardColumn = {
  id: string;
  label: string;
};

export function deriveChartData(
  rows: WhiteboardRow[],
  categoryId: string,
  seriesId: string,
) {
  return rows.map((row) => ({
    label: row[categoryId] ?? "",
    value: Number.parseFloat((row[seriesId] ?? "").replaceAll(",", "")) || 0,
  }));
}