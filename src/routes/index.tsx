import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AreaChart as AreaIcon,
  ArrowDownUp,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Grip,
  Hand,
  LayoutGrid,
  LineChart as LineIcon,
  MessageSquareText,
  MoreHorizontal,
  MousePointer2,
  Plus,
  ScatterChart as ScatterIcon,
  Sparkles,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deriveChartData, type WhiteboardColumn, type WhiteboardRow } from "@/lib/whiteboard-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bảng trắng lớp học — Bảng & Biểu đồ" },
      {
        name: "description",
        content: "Bảng trắng tương tác để dạy học với bảng dữ liệu và biểu đồ cập nhật trực tiếp.",
      },
      { property: "og:title", content: "Bảng trắng lớp học — Bảng & Biểu đồ" },
      {
        property: "og:description",
        content: "Dạy học trực quan với bảng dữ liệu và biểu đồ đồng bộ theo thời gian thực.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Whiteboard,
});

type ChartType = "bar" | "line" | "area" | "pie" | "donut" | "scatter" | "radar";
type Position = { x: number; y: number };
type ChartWidget = {
  id: string;
  type: ChartType;
  categoryId: string;
  seriesId: string;
  title: string;
  position: Position;
};

const initialColumns: WhiteboardColumn[] = [
  { id: "student", label: "Học sinh" },
  { id: "math", label: "Toán" },
  { id: "science", label: "Khoa học" },
  { id: "language", label: "Ngữ văn" },
];

const initialRows: WhiteboardRow[] = [
  { student: "Minh Anh", math: "9.2", science: "8.5", language: "8.8" },
  { student: "Hoàng Nam", math: "7.8", science: "9.1", language: "8.2" },
  { student: "Thảo Vy", math: "8.7", science: "8.9", language: "9.4" },
  { student: "Gia Bảo", math: "8.1", science: "7.6", language: "8.5" },
  { student: "Khánh Linh", math: "9.6", science: "9.3", language: "9.1" },
];

const chartOptions: { type: ChartType; name: string; hint: string; icon: typeof BarChart3 }[] = [
  { type: "bar", name: "Biểu đồ cột", hint: "So sánh giá trị", icon: BarChart3 },
  { type: "line", name: "Biểu đồ đường", hint: "Theo dõi xu hướng", icon: LineIcon },
  { type: "area", name: "Biểu đồ miền", hint: "Nhìn tổng quan thay đổi", icon: AreaIcon },
  { type: "pie", name: "Biểu đồ tròn", hint: "Tỷ trọng từng nhóm", icon: Activity },
  { type: "donut", name: "Biểu đồ vành khuyên", hint: "Tỷ trọng dạng vòng", icon: CircleHelp },
  { type: "scatter", name: "Biểu đồ phân tán", hint: "Tìm mối liên hệ", icon: ScatterIcon },
  { type: "radar", name: "Biểu đồ radar", hint: "So sánh nhiều tiêu chí", icon: ArrowDownUp },
];

const palette = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function Whiteboard() {
  const [columns, setColumns] = useState(initialColumns);
  const [rows, setRows] = useState(initialRows);
  const [charts, setCharts] = useState<ChartWidget[]>([]);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<ChartType>("bar");
  const [activeTool, setActiveTool] = useState("select");
  const [columnCount, setColumnCount] = useState(initialColumns.length);

  const numericColumns = useMemo(
    () => columns.filter((column) => rows.some((row) => Number.isFinite(Number(row[column.id])) && row[column.id] !== "")),
    [columns, rows],
  );
  const categoryColumns = columns.filter((column) => !numericColumns.some((num) => num.id === column.id));
  const categoryOptions = categoryColumns.length > 0 ? categoryColumns : columns;
  const seriesOptions = numericColumns.length > 0 ? numericColumns : columns;

  const addColumn = () => {
    const nextNumber = columnCount + 1;
    setColumnCount(nextNumber);
    const column = { id: `subject-${nextNumber}`, label: `Môn ${nextNumber - 3}` };
    setColumns((current) => [...current, column]);
    setRows((current) => current.map((row) => ({ ...row, [column.id]: "" })));
  };

  const removeColumn = (columnId: string) => {
    if (columns.length <= 2) return;
    setColumns((current) => current.filter((column) => column.id !== columnId));
    setRows((current) => current.map((row) => {
      const next = { ...row };
      delete next[columnId];
      return next;
    }));
    setCharts((current) => current.map((chart) => ({
      ...chart,
      categoryId: chart.categoryId === columnId ? (columns.find((item) => item.id !== columnId)?.id ?? "") : chart.categoryId,
      seriesId: chart.seriesId === columnId ? (columns.find((item) => item.id !== columnId)?.id ?? "") : chart.seriesId,
    })));
  };

  const updateCell = (rowIndex: number, columnId: string, value: string) => {
    setRows((current) => current.map((row, index) => index === rowIndex ? { ...row, [columnId]: value } : row));
  };

  const addRow = () => {
    const newRow: WhiteboardRow = {};
    columns.forEach((column) => { newRow[column.id] = column.id === columns[0]?.id ? `Học sinh ${rows.length + 1}` : ""; });
    setRows((current) => [...current, newRow]);
  };

  const removeRow = (rowIndex: number) => setRows((current) => current.filter((_, index) => index !== rowIndex));

  const addChart = (type: ChartType) => {
    const chartId = `chart-${Date.now()}`;
    const categoryId = categoryOptions[0]?.id ?? columns[0]?.id ?? "";
    const seriesId = numericColumns[0]?.id ?? columns[1]?.id ?? columns[0]?.id ?? "";
    setCharts((current) => [...current, {
      id: chartId,
      type,
      categoryId,
      seriesId,
      title: chartOptions.find((option) => option.type === type)?.name ?? "Biểu đồ",
      position: { x: 650 + current.length * 36, y: 74 + current.length * 44 },
    }]);
    setChartDialogOpen(false);
    setActiveTool("select");
  };

  const moveWidget = (id: string, position: Position) => {
    setCharts((current) => current.map((chart) => chart.id === id ? { ...chart, position } : chart));
  };

  return (
    <main className="whiteboard-app min-h-screen bg-background text-foreground">
      <header className="wb-topbar flex h-[68px] items-center justify-between border-b border-border bg-background px-5 md:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="wb-brand-mark flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <LayoutGrid className="size-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight">Bảng trắng lớp học</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-chart-2" />
              <span>Toán · Phân tích dữ liệu</span>
              <ChevronDown className="size-3" />
            </div>
          </div>
          <span className="wb-save-state ml-2 hidden items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground sm:flex">
            <Check className="size-3" /> Đã lưu
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Bình luận" title="Bình luận" className="text-muted-foreground">
            <MessageSquareText />
          </Button>
          <Button variant="outline" size="sm" className="hidden gap-2 sm:inline-flex">
            <ClipboardList className="size-4" /> Bài học
          </Button>
          <Button size="sm" className="gap-2 px-3">
            <Sparkles className="size-4" /> <span className="hidden sm:inline">Trình chiếu</span>
          </Button>
        </div>
      </header>

      <div className="wb-workspace flex min-h-[calc(100vh-68px)]">
        <aside className="wb-rail flex w-[58px] shrink-0 flex-col items-center gap-2 border-r border-border bg-background py-4" aria-label="Công cụ">
          <ToolButton label="Chọn và di chuyển" active={activeTool === "select"} onClick={() => setActiveTool("select")}>
            <MousePointer2 />
          </ToolButton>
          <ToolButton label="Di chuyển canvas" active={activeTool === "hand"} onClick={() => setActiveTool("hand")}>
            <Hand />
          </ToolButton>
          <div className="my-1 h-px w-7 bg-border" />
          <ToolButton label="Thêm bảng" active={activeTool === "table"} onClick={() => {
            setActiveTool("table");
            const newColId = `data-${Date.now()}`;
            setColumns((current) => [...current, { id: newColId, label: "Ghi chú" }]);
            setRows((current) => current.map((row) => ({ ...row, [newColId]: "" })));
          }}>
            <Table2 />
          </ToolButton>
          <ToolButton label="Thêm biểu đồ" active={false} onClick={() => setChartDialogOpen(true)}>
            <BarChart3 />
          </ToolButton>
          <ToolButton label="Thêm ghi chú" active={activeTool === "note"} onClick={() => setActiveTool("note")}>
            <MessageSquareText />
          </ToolButton>
          <div className="mt-auto">
            <ToolButton label="Trợ giúp" active={false} onClick={() => setActiveTool("help")}>
              <CircleHelp />
            </ToolButton>
          </div>
        </aside>

        <section className="wb-stage-wrap relative min-w-0 flex-1 overflow-auto" aria-label="Bảng trắng">
          <div className="wb-stage canvas-grid relative min-h-[calc(100vh-68px)] min-w-[1060px]">
            <div className="wb-stage-label pointer-events-none absolute left-7 top-5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-chart-2" /> LỚP 8A · BUỔI 12
            </div>
            <TableWidget
              columns={columns}
              rows={rows}
              updateCell={updateCell}
              addColumn={addColumn}
              removeColumn={removeColumn}
              addRow={addRow}
              removeRow={removeRow}
            />
            {charts.map((chart) => (
              <ChartWidgetCard
                key={chart.id}
                chart={chart}
                columns={columns}
                rows={rows}
                categoryOptions={categoryOptions}
                seriesOptions={seriesOptions}
                onMove={(position) => moveWidget(chart.id, position)}
                onRemove={() => setCharts((current) => current.filter((item) => item.id !== chart.id))}
                onChange={(updates) => setCharts((current) => current.map((item) => item.id === chart.id ? { ...item, ...updates } : item))}
              />
            ))}
            <div className="wb-stage-hint pointer-events-none absolute bottom-5 right-7 flex items-center gap-2 text-xs text-muted-foreground">
              <Grip className="size-3.5" /> Kéo thả để sắp xếp không gian lớp học
            </div>
          </div>
        </section>
      </div>

      <Dialog open={chartDialogOpen} onOpenChange={setChartDialogOpen}>
        <DialogContent className="wb-chart-dialog max-w-[600px] gap-0 p-0">
          <DialogHeader className="border-b border-border px-6 py-5 text-left">
            <DialogTitle className="text-lg">Chọn loại biểu đồ</DialogTitle>
            <DialogDescription className="mt-1">Tạo biểu đồ từ dữ liệu đang có trên bảng.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
            {chartOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedChartType === option.type;
              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setSelectedChartType(option.type)}
                  onDoubleClick={() => addChart(option.type)}
                  className={`wb-chart-option flex min-h-[76px] items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors ${isSelected ? "is-selected" : ""}`}
                >
                  <span className="wb-chart-option-icon flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{option.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{option.hint}</span>
                  </span>
                  {isSelected && <span className="wb-selected-check flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span>}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-xs text-muted-foreground">Biểu đồ có thể di chuyển và chỉnh sửa sau khi tạo.</p>
            <Button onClick={() => addChart(selectedChartType)} className="gap-2">
              Tạo biểu đồ <Plus className="size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={`wb-tool-button ${active ? "is-active" : ""}`}
    >
      {children}
    </Button>
  );
}

function TableWidget({
  columns,
  rows,
  updateCell,
  addColumn,
  removeColumn,
  addRow,
  removeRow,
}: {
  columns: WhiteboardColumn[];
  rows: WhiteboardRow[];
  updateCell: (rowIndex: number, columnId: string, value: string) => void;
  addColumn: () => void;
  removeColumn: (columnId: string) => void;
  addRow: () => void;
  removeRow: (rowIndex: number) => void;
}) {
  const [position, setPosition] = useState<Position>({ x: 34, y: 74 });
  const [dragStart, setDragStart] = useState<{ pointer: Position; origin: Position } | null>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    setPosition({
      x: Math.max(0, dragStart.origin.x + event.clientX - dragStart.pointer.x),
      y: Math.max(20, dragStart.origin.y + event.clientY - dragStart.pointer.y),
    });
  };

  return (
    <article
      className="wb-widget wb-table-widget absolute"
      style={{ left: position.x, top: position.y }}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setDragStart(null)}
      onPointerCancel={() => setDragStart(null)}
    >
      <div
        className="wb-widget-top flex h-12 items-center justify-between border-b border-border px-4"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          setDragStart({ pointer: { x: event.clientX, y: event.clientY }, origin: position });
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="wb-widget-icon table-icon flex size-7 shrink-0 items-center justify-center rounded-md bg-chart-1/10 text-chart-1"><Table2 className="size-4" /></span>
          <div className="min-w-0">
            <h2 className="truncate text-[13px] font-semibold">Bảng điểm lớp 8A</h2>
            <p className="text-[10px] text-muted-foreground">{rows.length} học sinh · {columns.length} cột</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="wb-drag-grip flex items-center justify-center text-muted-foreground" title="Kéo để di chuyển"><Grip className="size-4" /></span>
          <Button variant="ghost" size="icon" aria-label="Tuỳ chọn bảng" title="Tuỳ chọn bảng" className="size-7 text-muted-foreground"><MoreHorizontal /></Button>
        </div>
      </div>
      <div className="wb-table-scroll overflow-x-auto px-3 pt-2">
        <table className="wb-data-table w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th className="wb-row-number">#</th>
              {columns.map((column, index) => (
                <th key={column.id} className="wb-data-th">
                  <div className="group flex min-w-[82px] items-center gap-1">
                    <input
                      value={column.label}
                      aria-label={`Tên cột ${index + 1}`}
                      onChange={(event) => {
                        const value = event.target.value;
                        const heading = document.querySelector(`input[aria-label="Tên cột ${index + 1}"]`);
                        if (heading) heading.setAttribute("data-value", value);
                        // Column labels are stored independently from cell data.
                        window.dispatchEvent(new CustomEvent("whiteboard:column-label", { detail: { id: column.id, value } }));
                      }}
                      className="wb-column-name w-full min-w-0 bg-transparent px-1.5 py-1 text-[11px] font-semibold outline-none"
                    />
                    {columns.length > 2 && <button type="button" aria-label={`Xóa cột ${column.label}`} onClick={() => removeColumn(column.id)} className="wb-remove-column hidden size-5 shrink-0 items-center justify-center rounded text-muted-foreground group-hover:flex"><X className="size-3" /></button>}
                  </div>
                </th>
              ))}
              <th className="wb-add-column-cell"><Button variant="ghost" size="icon" aria-label="Thêm cột" title="Thêm cột" onClick={addColumn} className="size-6"><Plus className="size-3.5" /></Button></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                <td className="wb-row-number">{String(rowIndex + 1).padStart(2, "0")}</td>
                {columns.map((column, colIndex) => (
                  <td key={column.id} className={colIndex === 0 ? "wb-name-cell" : "wb-score-cell"}>
                    <input
                      value={row[column.id] ?? ""}
                      aria-label={`${columns[colIndex]?.label ?? "Ô"}, dòng ${rowIndex + 1}`}
                      onChange={(event) => updateCell(rowIndex, column.id, event.target.value)}
                      className="wb-cell-input w-full bg-transparent px-2 py-2 text-[12px] outline-none"
                    />
                  </td>
                ))}
                <td className="wb-row-action"><button type="button" onClick={() => removeRow(rowIndex)} aria-label={`Xóa dòng ${rowIndex + 1}`} className="wb-remove-row flex size-6 items-center justify-center rounded text-muted-foreground"><Trash2 className="size-3" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <Button variant="ghost" size="sm" onClick={addRow} className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"><Plus className="size-3.5" /> Thêm dòng</Button>
        <span className="text-[10px] text-muted-foreground">Thay đổi tự động đồng bộ</span>
      </div>
    </article>
  );
}

function ChartWidgetCard({
  chart,
  columns,
  rows,
  categoryOptions,
  seriesOptions,
  onMove,
  onRemove,
  onChange,
}: {
  chart: ChartWidget;
  columns: WhiteboardColumn[];
  rows: WhiteboardRow[];
  categoryOptions: WhiteboardColumn[];
  seriesOptions: WhiteboardColumn[];
  onMove: (position: Position) => void;
  onRemove: () => void;
  onChange: (updates: Partial<ChartWidget>) => void;
}) {
  const [dragStart, setDragStart] = useState<{ pointer: Position; origin: Position } | null>(null);
  const data = deriveChartData(rows, chart.categoryId, chart.seriesId);
  const numericColumn = columns.find((column) => column.id === chart.seriesId);
  const categoryColumn = columns.find((column) => column.id === chart.categoryId);
  const isPie = chart.type === "pie" || chart.type === "donut";

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    onMove({
      x: Math.max(0, dragStart.origin.x + event.clientX - dragStart.pointer.x),
      y: Math.max(20, dragStart.origin.y + event.clientY - dragStart.pointer.y),
    });
  };

  return (
    <article
      className="wb-widget wb-chart-widget absolute"
      style={{ left: chart.position.x, top: chart.position.y }}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setDragStart(null)}
      onPointerCancel={() => setDragStart(null)}
    >
      <div
        className="wb-widget-top flex h-12 items-center justify-between border-b border-border px-4"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          setDragStart({ pointer: { x: event.clientX, y: event.clientY }, origin: chart.position });
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="wb-widget-icon chart-icon flex size-7 shrink-0 items-center justify-center rounded-md bg-chart-2/10 text-chart-2"><BarChart3 className="size-4" /></span>
          <div className="min-w-0">
            <h2 className="truncate text-[13px] font-semibold">{chart.title}</h2>
            <p className="text-[10px] text-muted-foreground">{rows.length} điểm dữ liệu</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="wb-drag-grip flex items-center justify-center text-muted-foreground" title="Kéo để di chuyển"><Grip className="size-4" /></span>
          <Button variant="ghost" size="icon" aria-label="Xóa biểu đồ" title="Xóa biểu đồ" onClick={onRemove} className="size-7 text-muted-foreground hover:text-destructive"><Trash2 /></Button>
        </div>
      </div>
      <div className="wb-chart-controls flex flex-wrap items-center gap-2 px-4 pt-3">
        <span className="text-[10px] font-medium uppercase text-muted-foreground">Trục ngang</span>
        <Select value={chart.categoryId} onValueChange={(value) => onChange({ categoryId: value })}>
          <SelectTrigger className="h-7 w-[116px] border-0 bg-secondary px-2 text-xs shadow-none"><SelectValue /></SelectTrigger>
          <SelectContent>{categoryOptions.map((column) => <SelectItem key={column.id} value={column.id}>{column.label}</SelectItem>)}</SelectContent>
        </Select>
        {!isPie && <>
          <span className="ml-1 text-[10px] font-medium uppercase text-muted-foreground">Giá trị</span>
          <Select value={chart.seriesId} onValueChange={(value) => onChange({ seriesId: value })}>
            <SelectTrigger className="h-7 w-[108px] border-0 bg-secondary px-2 text-xs shadow-none"><SelectValue /></SelectTrigger>
            <SelectContent>{seriesOptions.map((column) => <SelectItem key={column.id} value={column.id}>{column.label}</SelectItem>)}</SelectContent>
          </Select>
        </>}
      </div>
      <div className="wb-chart-plot px-3 pb-2 pt-3">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === "bar" ? (
            <BarChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "var(--color-muted)" }} />
              <Bar dataKey="value" name={numericColumn?.label ?? "Giá trị"} fill={palette[0]} radius={[4, 4, 0, 0]} maxBarSize={38} />
            </BarChart>
          ) : chart.type === "line" ? (
            <LineChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" name={numericColumn?.label ?? "Giá trị"} stroke={palette[1]} strokeWidth={2.5} dot={{ r: 3, fill: palette[1] }} activeDot={{ r: 5 }} />
            </LineChart>
          ) : chart.type === "area" ? (
            <AreaChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="value" name={numericColumn?.label ?? "Giá trị"} stroke={palette[2]} fill={palette[2]} fillOpacity={0.18} strokeWidth={2.5} />
            </AreaChart>
          ) : isPie ? (
            <PieChart>
              <Tooltip />
              <Legend verticalAlign="bottom" height={24} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "10px" }} />
              <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="46%" outerRadius={76} innerRadius={chart.type === "donut" ? 48 : 0} paddingAngle={2}>
                {data.map((entry, index) => <Cell key={`${entry.label}-${index}`} fill={palette[index % palette.length]} />)}
              </Pie>
            </PieChart>
          ) : chart.type === "scatter" ? (
            <ScatterChart margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 4" stroke="var(--color-border)" />
              <XAxis dataKey="label" name={categoryColumn?.label ?? "Nhóm"} type="category" tick={{ fontSize: 10 }} />
              <YAxis dataKey="value" name={numericColumn?.label ?? "Giá trị"} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={data} fill={palette[3]} />
            </ScatterChart>
          ) : (
            <RadarChart data={data} outerRadius="72%">
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} />
              <Tooltip />
              <Radar name={numericColumn?.label ?? "Giá trị"} dataKey="value" stroke={palette[4]} fill={palette[4]} fillOpacity={0.25} />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-1.5 border-t border-border px-4 py-2.5 text-[10px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-chart-2" /> Cập nhật trực tiếp từ bảng
      </div>
    </article>
  );
}