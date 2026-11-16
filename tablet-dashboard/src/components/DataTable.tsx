import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, LayoutGrid, ArrowUpDown, ArrowUp, ArrowDown, X, ChevronDown } from "lucide-react";
import type { ColDef } from "@/types";

interface DataTableProps {
  title: string;
  allColumns: ColDef[];
  data: any[];
  loading: boolean;
  error: string | null;
  statusKey: string;
}

export default function DataTable({
  title,
  allColumns,
  data,
  loading,
  error,
  statusKey,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() =>
    allColumns.reduce((acc, c) => ({ ...acc, [c.key]: c.defaultVisible }), {})
  );

  const toggleColumn = (k: string) => setVisibleColumns((p) => ({ ...p, [k]: !p[k] }));
  const toggleAll = (v: boolean) =>
    setVisibleColumns(allColumns.reduce((a, c) => ({ ...a, [c.key]: v }), {}));

  const handleSort = (key: string) =>
    setSortConfig((p) =>
      p?.key === key ? (p.direction === "asc" ? { key, direction: "desc" } : null) : { key, direction: "asc" }
    );

  const processed = useMemo(() => {
    let r = [...data];
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      r = r.filter((row) =>
        allColumns.some((c) => String(row[c.key] || "").toLowerCase().includes(t))
      );
    }
    // 同欄位多選為 OR，跨欄位為 AND
    Object.entries(filters).forEach(([k, selectedValues]) => {
      if (selectedValues && selectedValues.length > 0) {
        r = r.filter((row) => {
          const raw = String(row[k] || "").trim();
          const matchVal = raw === "" ? "(空白 / 未填寫)" : raw;
          return selectedValues.includes(matchVal);
        });
      }
    });
    if (sortConfig) {
      r.sort((a, b) => {
        const cmp = String(a[sortConfig.key] || "").localeCompare(
          String(b[sortConfig.key] || ""),
          "zh-TW",
          { numeric: true }
        );
        return sortConfig.direction === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [data, searchTerm, filters, sortConfig, allColumns]);

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setSortConfig(null);
  };

  const removeSingleFilter = (key: string, val?: string) => {
    setFilters((p) => {
      if (!val) {
        const next = { ...p };
        delete next[key];
        return next;
      }
      const updated = (p[key] || []).filter((item) => item !== val);
      return { ...p, [key]: updated };
    });
  };

  const hasFilter =
    Object.values(filters).some((vals) => vals && vals.length > 0) ||
    searchTerm !== "" ||
    !!sortConfig;

  // 篩選後的狀態統計
  const filteredStats = useMemo(() => {
    const total = processed.length;
    const good = processed.filter((d) =>
      ["在庫", "可借用", "正常", "正常使用"].some((s) => String(d[statusKey] || "").includes(s))
    ).length;
    const inUse = processed.filter((d) =>
      ["借出", "借出中", "出借"].some((s) => String(d[statusKey] || "").includes(s))
    ).length;
    const bad = processed.filter((d) =>
      ["維修", "報廢", "損壞", "故障"].some((s) => String(d[statusKey] || "").includes(s))
    ).length;
    return { total, good, inUse, bad };
  }, [processed, statusKey]);

  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden flex flex-col flex-1 min-h-0 bg-white">
      <CardHeader className="p-3 sm:pb-3 sm:p-5 border-b border-slate-100 shrink-0">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-2.5 sm:gap-3">
          {/* 左側標題與篩選結果標籤 */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-800">{title}</CardTitle>
            <Badge variant="outline" className="text-xs font-normal bg-slate-50 text-slate-700 border-slate-200">
              篩選結果：{filteredStats.total} / {data.length} 筆
            </Badge>
            {filteredStats.good > 0 && (
              <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-normal">
                妥善/正常 {filteredStats.good}
              </Badge>
            )}
            {filteredStats.inUse > 0 && (
              <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-normal">
                借出 {filteredStats.inUse}
              </Badge>
            )}
            {filteredStats.bad > 0 && (
              <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 font-normal">
                維修/故障 {filteredStats.bad}
              </Badge>
            )}
            {/* 啟用的欄位篩選 Badge */}
            {Object.entries(filters).flatMap(([k, values]) =>
              (values || []).map((v) => (
                <Badge
                  key={`${k}_${v}`}
                  variant="secondary"
                  className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 font-normal flex items-center gap-1 cursor-pointer hover:bg-indigo-100"
                  onClick={() => removeSingleFilter(k, v)}
                  title="點擊清除此篩選項目"
                >
                  {k}: {v}
                  <X className="w-3 h-3 hover:text-indigo-900" />
                </Badge>
              ))
            )}
          </div>

          {/* 右側操作：清除按鈕、搜尋、顯示欄位選單 */}
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            {hasFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2 sm:px-3"
                onClick={clearFilters}
              >
                重設篩選
              </Button>
            )}
            <div className="relative flex-1 sm:w-56 min-w-[130px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="搜尋關鍵字..."
                className="pl-8 h-8 text-xs bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1.5 border-slate-200 px-2 sm:px-3">
                  <LayoutGrid className="w-3.5 h-3.5" /> 欄位設定
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
                <DropdownMenuLabel className="text-xs">顯示欄位控制</DropdownMenuLabel>
                <div className="flex px-2 py-1.5 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs h-7"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleAll(true);
                    }}
                  >
                    全部選取
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs h-7"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleAll(false);
                    }}
                  >
                    全部取消
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {allColumns.map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.key}
                    checked={visibleColumns[c.key]}
                    onCheckedChange={() => toggleColumn(c.key)}
                    className="text-xs"
                  >
                    {c.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 min-h-0 relative overflow-auto">
        {/* 手機/平板滑動提示 */}
        <div className="lg:hidden px-3 py-1 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0 select-none">
          <span>↔ 左右滑動檢視更多欄位</span>
          <span className="text-slate-400">共 {filteredStats.total} 筆</span>
        </div>
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-slate-50 sticky top-0 z-20 shadow-[0_1px_0_0_#e2e8f0]">
            <TableRow className="hover:bg-slate-50 border-b border-slate-200">
              {allColumns.map(
                (c) =>
                  visibleColumns[c.key] && (
                    <TableHead
                      key={c.key}
                      className="font-medium text-slate-700 whitespace-nowrap align-top pt-2.5 pb-2 min-w-[110px]"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div
                          className="flex items-center gap-1 cursor-pointer select-none hover:text-blue-600 group text-xs"
                          onClick={() => handleSort(c.key)}
                        >
                          <span>{c.label}</span>
                          {sortConfig?.key === c.key ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-3 h-3 text-blue-600" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-blue-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-40 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                        {c.filterable && (() => {
                          const selected = filters[c.key] || [];
                          const allOptions = Array.from(
                            new Set(
                              data
                                .map((d) => String(d[c.key] || "").trim())
                                .map((v) => (v === "" ? "(空白 / 未填寫)" : v))
                            )
                          ).sort((a, b) => {
                            if (a === "(空白 / 未填寫)") return 1;
                            if (b === "(空白 / 未填寫)") return -1;
                            return a.localeCompare(b, "zh-TW", { numeric: true });
                          });

                          return (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`h-6 text-[11px] px-2 flex items-center justify-between font-normal w-full max-w-[130px] transition-colors ${
                                    selected.length > 0
                                      ? "border-blue-500 text-blue-700 bg-blue-50/50 font-medium"
                                      : "border-slate-200 text-slate-600 bg-white hover:border-blue-400"
                                  }`}
                                >
                                  <span className="truncate">
                                    {selected.length === 0
                                      ? "全部"
                                      : `已選 ${selected.length} 項`}
                                  </span>
                                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="start"
                                className="w-56 p-2 bg-white shadow-lg border border-slate-200 text-xs z-50"
                              >
                                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                                  <span className="font-semibold text-slate-700">
                                    {c.label} ({selected.length}/{allOptions.length})
                                  </span>
                                  <div className="flex items-center gap-2 text-[11px]">
                                    {selected.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setFilters((p) => ({ ...p, [c.key]: [] }))
                                        }
                                        className="text-rose-600 hover:underline"
                                      >
                                        清除
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFilters((p) => ({
                                          ...p,
                                          [c.key]:
                                            selected.length === allOptions.length
                                              ? []
                                              : [...allOptions],
                                        }))
                                      }
                                      className="text-blue-600 hover:underline"
                                    >
                                      {selected.length === allOptions.length
                                        ? "重設"
                                        : "全選"}
                                    </button>
                                  </div>
                                </div>
                                <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
                                  {allOptions.map((opt) => {
                                    const checked = selected.includes(opt);
                                    return (
                                      <label
                                        key={opt}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer select-none transition-colors ${
                                          checked
                                            ? "bg-blue-50 text-blue-900 font-medium"
                                            : "hover:bg-slate-50 text-slate-700"
                                        }`}
                                      >
                                        <Checkbox
                                          checked={checked}
                                          onCheckedChange={(val) => {
                                            setFilters((prev) => {
                                              const cur = prev[c.key] || [];
                                              const next = val
                                                ? [...cur, opt]
                                                : cur.filter((x) => x !== opt);
                                              return { ...prev, [c.key]: next };
                                            });
                                          }}
                                        />
                                        <span className="truncate">{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </PopoverContent>
                            </Popover>
                          );
                        })()}
                      </div>
                    </TableHead>
                  )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && data.length === 0 ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {allColumns.map(
                    (c, j) =>
                      visibleColumns[c.key] && (
                        <TableCell key={j} className="py-3">
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                      )
                  )}
                </TableRow>
              ))
            ) : processed.length === 0 && !loading && !error ? (
              <TableRow>
                <TableCell
                  colSpan={allColumns.filter((c) => visibleColumns[c.key]).length}
                  className="text-center py-20 text-slate-400 text-sm"
                >
                  未找到符合篩選條件的資料。
                </TableCell>
              </TableRow>
            ) : (
              processed.map((row, i) => (
                <TableRow
                  key={row._rowId || `${row["設備ID"] || row["平板車ID編號"] || "row"}_${row["平板車ID"] || ""}_${i}`}
                  className="hover:bg-blue-50/40 transition-colors border-b border-slate-100 text-xs text-slate-700"
                >
                  {allColumns.map((c) => {
                    if (!visibleColumns[c.key]) return null;
                    const val = String(row[c.key] ?? "").trim();
                    if (c.key === "設備狀態" || c.key === "狀態") {
                      const isGood =
                        val.includes("在庫") ||
                        val === "可借用" ||
                        val.includes("正常") ||
                        val.includes("正常使用");
                      const isInUse = val.includes("借出");
                      const isBad =
                        val.includes("維修") ||
                        val.includes("報廢") ||
                        val.includes("故障") ||
                        val.includes("損壞");
                      return (
                        <TableCell key={c.key} className="whitespace-nowrap py-2.5">
                          <Badge
                            className={`text-[11px] font-normal ${
                              isGood
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isInUse
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : isBad
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {val || "未註記"}
                          </Badge>
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell key={c.key} className="whitespace-nowrap py-2.5">
                        {val || "-"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
