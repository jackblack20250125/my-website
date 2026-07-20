import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Laptop, Bus, AlertCircle, CheckCircle2, Search, RefreshCw, AlertTriangle, LayoutGrid, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_URL = "https://script.google.com/macros/s/AKfycbyc3bZR6ckFHinD11MpZ1oe8G-X7U4T6jcMhQK52wIfEa4PrjWapAZ1PHrjQjBZCtr7/exec";
const TABLET_SHEET = "平板資料";
const CART_SHEET = "平板車資料";

// ── 載具欄位定義 ──────────────────────────────────────────────
const tabletColumns = [
  { key: "設備ID",       label: "設備ID",       defaultVisible: true,  filterable: false },
  { key: "設備類型",     label: "設備類型",     defaultVisible: false, filterable: true  },
  { key: "品牌",         label: "品牌",         defaultVisible: false, filterable: true  },
  { key: "型號",         label: "型號",         defaultVisible: true,  filterable: true  },
  { key: "配備",         label: "配備",         defaultVisible: false, filterable: true  },
  { key: "財產編號",     label: "財產編號",     defaultVisible: false, filterable: false },
  { key: "設備序號",     label: "設備序號",     defaultVisible: false, filterable: false },
  { key: "MAC位址",      label: "MAC位址",      defaultVisible: false, filterable: false },
  { key: "平板車ID",     label: "平板車ID",     defaultVisible: true,  filterable: true  },
  { key: "入校年度",     label: "入校年度",     defaultVisible: false, filterable: true  },
  { key: "購買日期",     label: "購買日期",     defaultVisible: false, filterable: false },
  { key: "保固到期日",   label: "保固到期日",   defaultVisible: false, filterable: false },
  { key: "設備狀態",     label: "設備狀態",     defaultVisible: true,  filterable: true  },
  { key: "相關計畫",     label: "相關計畫",     defaultVisible: true,  filterable: true  },
  { key: "最後盤點日期", label: "最後盤點日期", defaultVisible: false, filterable: true  },
  { key: "備註",         label: "備註",         defaultVisible: true,  filterable: false },
];

// ── 平板車欄位定義 ──────────────────────────────────────────────
const cartColumns = [
  { key: "平板車ID編號", label: "平板車ID",   defaultVisible: true,  filterable: false },
  { key: "鑰匙編號",     label: "鑰匙編號",   defaultVisible: true,  filterable: false },
  { key: "載具數量",     label: "載具數量",   defaultVisible: true,  filterable: true  },
  { key: "設備容量",     label: "設備容量",   defaultVisible: true,  filterable: true  },
  { key: "所在班級",     label: "所在班級",   defaultVisible: true,  filterable: true  },
  { key: "放置位置",     label: "放置位置",   defaultVisible: true,  filterable: true  },
  { key: "管理者",       label: "管理者",     defaultVisible: true,  filterable: true  },
  { key: "狀態",         label: "狀態",       defaultVisible: true,  filterable: true  },
  { key: "入校年度",     label: "入校年度",   defaultVisible: false, filterable: true  },
  { key: "相關計畫",     label: "相關計畫",   defaultVisible: true,  filterable: true  },
  { key: "過保年限",     label: "過保年限",   defaultVisible: false, filterable: false },
  { key: "使用年限",     label: "使用年限",   defaultVisible: false, filterable: false },
  { key: "備註",         label: "備註",       defaultVisible: false, filterable: false },
];

type ColDef = typeof tabletColumns[0];

// ── 可重用的資料表格區塊 ──────────────────────────────────────
function DataTable({
  allColumns,
  data,
  loading,
  error,
  statusKey,
}: {
  allColumns: ColDef[];
  data: any[];
  loading: boolean;
  error: string | null;
  statusKey: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    allColumns.reduce((acc, c) => ({ ...acc, [c.key]: c.defaultVisible }), {})
  );

  const toggleColumn = (k: string) => setVisibleColumns(p => ({ ...p, [k]: !p[k] }));
  const toggleAll = (v: boolean) => setVisibleColumns(allColumns.reduce((a, c) => ({ ...a, [c.key]: v }), {}));

  const handleSort = (key: string) =>
    setSortConfig(p =>
      p?.key === key ? (p.direction === "asc" ? { key, direction: "desc" } : null) : { key, direction: "asc" }
    );

  const processed = useMemo(() => {
    let r = [...data];
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      r = r.filter(row => allColumns.some(c => String(row[c.key] || "").toLowerCase().includes(t)));
    }
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== "ALL") r = r.filter(row => String(row[k] || "").trim() === v.trim());
    });
    if (sortConfig)
      r.sort((a, b) => {
        const cmp = String(a[sortConfig.key] || "").localeCompare(String(b[sortConfig.key] || ""), "zh-TW", { numeric: true });
        return sortConfig.direction === "asc" ? cmp : -cmp;
      });
    return r;
  }, [data, searchTerm, filters, sortConfig, allColumns]);

  const clearFilters = () => { setFilters({}); setSearchTerm(""); setSortConfig(null); };
  const hasFilter = Object.keys(filters).some(k => filters[k] && filters[k] !== "ALL") || searchTerm !== "" || !!sortConfig;

  // 篩選後的狀態統計
  const filteredStats = useMemo(() => {
    const total = processed.length;
    const good = processed.filter(d => ["在庫", "可借用", "正常", "正常使用"].some(s => String(d[statusKey] || "").includes(s))).length;
    const inUse = processed.filter(d => ["借出", "借出中", "出借"].some(s => String(d[statusKey] || "").includes(s))).length;
    const bad = processed.filter(d => ["維修", "報廢", "損壞", "故障"].some(s => String(d[statusKey] || "").includes(s))).length;
    return { total, good, inUse, bad };
  }, [processed, statusKey]);

  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden flex flex-col flex-1 min-h-0 min-w-0">
      <CardHeader className="pb-3 border-b border-slate-100 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <CardTitle className="text-lg">設備清單</CardTitle>
            <Badge variant="outline" className="text-xs font-normal">
              篩選結果：{filteredStats.total} / {data.length} 筆
            </Badge>
            {filteredStats.good > 0 && <Badge className="text-xs bg-green-100 text-green-800 border-green-200 font-normal">正常 {filteredStats.good}</Badge>}
            {filteredStats.inUse > 0 && <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 font-normal">借出 {filteredStats.inUse}</Badge>}
            {filteredStats.bad > 0 && <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-200 font-normal">維修/故障 {filteredStats.bad}</Badge>}
            {Object.entries(filters)
              .filter(([, v]) => v && v !== "ALL")
              .map(([k, v]) => (
                <Badge key={k} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-normal">
                  {k}: {v}
                </Badge>
              ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {hasFilter && (
              <Button variant="ghost" size="sm" className="text-slate-500" onClick={clearFilters}>清除條件</Button>
            )}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="搜尋關鍵字..." className="pl-9 bg-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" /> 顯示欄位
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
                <DropdownMenuLabel>切換顯示欄位</DropdownMenuLabel>
                <div className="flex px-2 py-1.5 gap-2">
                  <Button variant="secondary" size="sm" className="flex-1 text-xs h-7" onClick={e => { e.preventDefault(); toggleAll(true); }}>全選</Button>
                  <Button variant="secondary" size="sm" className="flex-1 text-xs h-7" onClick={e => { e.preventDefault(); toggleAll(false); }}>全部取消</Button>
                </div>
                <DropdownMenuSeparator />
                {allColumns.map(c => (
                  <DropdownMenuCheckboxItem key={c.key} checked={visibleColumns[c.key]} onCheckedChange={() => toggleColumn(c.key)}>
                    {c.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 min-h-0 min-w-0 relative [&>div]:h-full [&>div]:overflow-auto">
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-slate-100 sticky top-0 z-20 shadow-[0_1px_0_0_#e2e8f0]">
            <TableRow className="hover:bg-slate-100">
              {allColumns.map(c => visibleColumns[c.key] && (
                <TableHead key={c.key} className="font-semibold whitespace-nowrap align-top pt-3 pb-2 min-w-[120px]">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1 cursor-pointer select-none hover:text-slate-900 group" onClick={() => handleSort(c.key)}>
                      {c.label}
                      {sortConfig?.key === c.key
                        ? sortConfig.direction === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                        : <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-30 group-hover:opacity-100 transition-opacity" />}
                    </div>
                    {c.filterable && (
                      <select
                        className="text-xs border border-slate-200 rounded px-1 py-1 bg-white font-normal text-slate-700 w-full hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-w-[140px]"
                        value={filters[c.key] || "ALL"}
                        onChange={e => setFilters(p => ({ ...p, [c.key]: e.target.value }))}
                      >
                        <option value="ALL">全部</option>
                        {Array.from(new Set(data.map(d => String(d[c.key] || "")).filter(Boolean)))
                          .sort((a, b) => a.localeCompare(b, "zh-TW", { numeric: true }))
                          .map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && data.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {allColumns.map((c, j) => visibleColumns[c.key] && <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}
                  </TableRow>
                ))
              : processed.length === 0 && !loading && !error
              ? (
                  <TableRow>
                    <TableCell colSpan={allColumns.filter(c => visibleColumns[c.key]).length} className="text-center py-16 text-slate-500">
                      目前沒有符合篩選條件的資料。
                    </TableCell>
                  </TableRow>
                )
              : processed.map((row, i) => (
                  <TableRow key={row["設備ID"] || row["平板車ID編號"] || i} className="hover:bg-slate-50">
                    {allColumns.map(c => {
                      if (!visibleColumns[c.key]) return null;
                      const val = row[c.key] || "";
                      if (c.key === "設備狀態" || c.key === "狀態") {
                        const s = String(val);
                        const isGood = s.includes("在庫") || s === "可借用" || s.includes("正常") || s.includes("正常使用");
                        const isInUse = s.includes("借出");
                        const isBad = s.includes("維修") || s.includes("報廢") || s.includes("故障");
                        return (
                          <TableCell key={c.key} className="whitespace-nowrap py-2">
                            <Badge className={isGood ? "bg-green-100 text-green-800 border-green-200" : isInUse ? "bg-blue-100 text-blue-800 border-blue-200" : isBad ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-slate-100 text-slate-700"}>
                              {val || "-"}
                            </Badge>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={c.key} className={`text-slate-600 py-2 ${c.key === "備註" ? "min-w-[200px] whitespace-normal" : "whitespace-nowrap"}`}>
                          {val}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── 主元件 ────────────────────────────────────────────────────
export default function DashboardStyle1() {
  const [tabletData, setTabletData] = useState<any[]>([]);
  const [cartData, setCartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSheet = async (sheetName: string) => {
    const r = await fetch(`${API_URL}?action=read&sheetName=${encodeURIComponent(sheetName)}`);
    if (!r.ok) throw new Error(`${sheetName} 網路請求失敗`);
    const j = await r.json();
    if (j.status !== "success") throw new Error(j.message || `${sheetName} 取得失敗`);
    return j.data;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tablets, carts] = await Promise.all([fetchSheet(TABLET_SHEET), fetchSheet(CART_SHEET)]);
      setTabletData(tablets.filter((r: any) => String(r["設備ID"] || "").trim() !== ""));
      setCartData(carts.filter((r: any) => String(r["平板車ID編號"] || "").trim() !== ""));
    } catch (e: any) {
      setError(e.message || "發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const tabletStats = useMemo(() => ({
    total: tabletData.length,
    available: tabletData.filter(d => ["在庫", "可借用", "正常"].some(s => String(d["設備狀態"]).includes(s))).length,
    inUse: tabletData.filter(d => ["借出", "借出中", "出借"].some(s => String(d["設備狀態"]).includes(s))).length,
    repairing: tabletData.filter(d => ["維修", "報廢", "損壞", "故障"].some(s => String(d["設備狀態"]).includes(s))).length,
  }), [tabletData]);

  const cartStats = useMemo(() => ({
    total: cartData.length,
    normal: cartData.filter(d => ["正常", "正常使用"].some(s => String(d["狀態"]).includes(s))).length,
  }), [cartData]);

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">IT 資產管理系統</h1>
          <p className="text-slate-500 mt-1">專業資訊面板，即時掌握全校平板狀態。</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> 重新整理
        </Button>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center gap-3 shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 shrink-0">
        <Card className="shadow-sm border-blue-100 col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-slate-500">載具總數</CardTitle>
            <Laptop className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">{loading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">{tabletStats.total}</div>}</CardContent>
        </Card>
        <Card className="shadow-sm border-green-100 col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-slate-500">妥善可用</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">{loading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold text-green-600">{tabletStats.available}</div>}</CardContent>
        </Card>
        <Card className="shadow-sm border-orange-100 col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-slate-500">目前借出</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">{loading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold text-orange-600">{tabletStats.inUse}</div>}</CardContent>
        </Card>
        <Card className="shadow-sm border-red-100 col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-slate-500">維修/故障</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">{loading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold text-red-600">{tabletStats.repairing}</div>}</CardContent>
        </Card>
        <Card className="shadow-sm border-purple-100 col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-slate-500">平板車總數</CardTitle>
            <Bus className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">{loading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold text-purple-700">{cartStats.total}</div>}</CardContent>
        </Card>
        <Card className="shadow-sm border-teal-100 col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-slate-500">妥善可用</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">{loading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold text-teal-600">{cartStats.normal}</div>}</CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tablets" className="flex flex-col flex-1 min-h-0">
        <TabsList className="shrink-0 w-fit">
          <TabsTrigger value="tablets" className="flex items-center gap-1.5">
            <Laptop className="w-4 h-4" /> 載具清單
          </TabsTrigger>
          <TabsTrigger value="carts" className="flex items-center gap-1.5">
            <Bus className="w-4 h-4" /> 平板車清單
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tablets" className="flex flex-col flex-1 min-h-0 mt-4 data-[state=inactive]:hidden">
          <DataTable allColumns={tabletColumns} data={tabletData} loading={loading} error={error} statusKey="設備狀態" />
        </TabsContent>
        <TabsContent value="carts" className="flex flex-col flex-1 min-h-0 mt-4 data-[state=inactive]:hidden">
          <DataTable allColumns={cartColumns} data={cartData} loading={loading} error={error} statusKey="狀態" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
