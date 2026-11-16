import { useState, useEffect, useCallback } from "react";
import { API_URL, TABLET_SHEET, CART_SHEET } from "./config";
import { tabletColumns, cartColumns, MENU_ITEMS } from "./types";
import DashboardView from "./components/DashboardView";
import DataTable from "./components/DataTable";
import ClassroomView from "./components/ClassroomView";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Tablet,
  Bus,
  School,
  RefreshCw,
  ChevronRight,
  Layers,
  AlertTriangle,
  Radio,
  Menu,
  Home,
  ArrowLeft,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tabletData, setTabletData] = useState<any[]>([]);
  const [cartData, setCartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchSheet = async (sheetName: string) => {
        const res = await fetch(
          `${API_URL}?sheetName=${encodeURIComponent(sheetName)}`
        );
        if (!res.ok) throw new Error(`${sheetName} 伺服器請求失敗 (${res.status})`);
        const json = await res.json();
        if (json.status !== "success") {
          throw new Error(json.message || `${sheetName} 讀取失敗`);
        }
        return json.data || [];
      };

      const [tablets, carts] = await Promise.all([
        fetchSheet(TABLET_SHEET),
        fetchSheet(CART_SHEET),
      ]);

      // 排除無設備ID或空白的列，並賦予唯一識別碼避免 React Key 碰撞
      const cleanTablets = tablets
        .filter((r: any) => String(r["設備ID"] || "").trim() !== "")
        .map((r: any, idx: number) => ({
          ...r,
          _rowId: `tablet_${r["設備ID"]}_${r["平板車ID"] || "none"}_${idx}`,
        }));
      const cleanCarts = carts
        .filter((r: any) => String(r["平板車ID編號"] || "").trim() !== "")
        .map((r: any, idx: number) => ({
          ...r,
          _rowId: `cart_${r["平板車ID編號"]}_${idx}`,
        }));

      setTabletData(cleanTablets);
      setCartData(cleanCarts);
      const now = new Date();
      setLastUpdated(
        `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(
          now.getDate()
        ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );
    } catch (e: any) {
      setError(e.message || "讀取試算表資料時發生錯誤");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 圖示對應表
  const renderIcon = (name: string, className = "w-4 h-4") => {
    switch (name) {
      case "LayoutDashboard":
        return <LayoutDashboard className={className} />;
      case "Tablet":
        return <Tablet className={className} />;
      case "Bus":
        return <Bus className={className} />;
      case "School":
        return <School className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  const currentItem =
    MENU_ITEMS.find((m) => m.id === activeTab) || MENU_ITEMS[0];

  // 獨立抽出的側欄內容組件，供桌面版與手機 Drawer 共用
  const renderSidebar = (onItemClick?: () => void) => (
    <div className="flex flex-col h-full bg-[#2b2f33] text-slate-200 select-none">
      {/* 系統標題 / Logo 區塊 */}
      <div className="h-14 border-b border-[#383d42] px-4 flex items-center justify-between bg-[#222528] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-sm tracking-tight shadow-sm shrink-0">
            <Tablet className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-white leading-tight">
              數位學習平板系統
            </div>
            <div className="text-[10px] text-teal-400">高雄市路竹高中</div>
          </div>
        </div>
        <div
          className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"
          title="雲端資料庫連線中"
        />
      </div>

      {/* 返回資訊系統首頁 */}
      <div className="px-3 py-2.5 border-b border-[#383d42] bg-[#282c30] shrink-0">
        <a
          href="../"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-200 bg-[#34393e] hover:bg-[#3f454b] hover:text-white transition-all shadow-sm border border-slate-600/50 group"
          title="返回路竹高中資訊整合系統首頁"
        >
          <div className="w-7 h-7 rounded-md bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0">
            <Home className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-xs text-white group-hover:text-teal-300 transition-colors">
              返回資訊系統首頁
            </div>
            <div className="text-[10px] text-slate-400">
              LCHS Portal
            </div>
          </div>
          <ArrowLeft className="w-3.5 h-3.5 text-teal-400 group-hover:-translate-x-0.5 transition-transform shrink-0" />
        </a>
      </div>

      {/* 導覽選單項目列表 */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onItemClick?.();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-medium transition-all group ${
                isActive
                  ? "bg-[#f5f1e8] text-[#222528] font-bold shadow-sm"
                  : "text-slate-300 hover:bg-[#383d42] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    isActive
                      ? "text-[#1f2327]"
                      : "text-slate-400 group-hover:text-slate-200"
                  }
                >
                  {renderIcon(item.iconName, "w-4 h-4")}
                </span>
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.id === "tablets" && tabletData.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded ${
                      isActive
                        ? "bg-slate-300/80 text-slate-800"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {tabletData.length}
                  </span>
                )}
                {item.id === "carts" && cartData.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded ${
                      isActive
                        ? "bg-slate-300/80 text-slate-800"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {cartData.length}
                  </span>
                )}
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded ${
                      isActive
                        ? "bg-amber-200 text-amber-900"
                        : "bg-amber-950/60 text-amber-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive
                      ? "text-[#222528] translate-x-0.5"
                      : "text-slate-500 opacity-60 group-hover:opacity-100"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </nav>

      {/* 側欄底部：API 連動資訊 */}
      <div className="p-3 border-t border-[#383d42] bg-[#222528] shrink-0">
        <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>GAS API 連動</span>
          </div>
          <span className="text-[10px] text-slate-500">v2.6</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] w-full bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* ── 桌面版左側選單側欄 (>= lg 顯示) ───────────────────────── */}
      <aside className="hidden lg:flex w-60 xl:w-64 flex-col shrink-0 border-r border-[#222528] shadow-md z-30 select-none">
        {renderSidebar()}
      </aside>

      {/* ── 手機/平板抽屜側欄 (< lg 點擊漢堡選單彈出) ──────────────── */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 bg-[#2b2f33] border-r border-[#222528] text-slate-200 [&>button]:text-white [&>button]:hover:text-slate-300"
        >
          {renderSidebar(() => setMobileMenuOpen(false))}
        </SheetContent>
      </Sheet>

      {/* ── 右側主要工作區域 ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden bg-slate-50 min-w-0">
        {/* 頂部功能與路徑導覽列 (Breadcrumbs + 漢堡選單 + 回總首頁 + 重新整理) */}
        <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between shrink-0 shadow-sm z-20">
          {/* 左側：手機漢堡選單按鈕 + 回總首頁 + Breadcrumb */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0"
              onClick={() => setMobileMenuOpen(true)}
              title="開啟導覽選單"
              aria-label="開啟導覽選單"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* 一鍵返回資訊整合總首頁 (手機/電腦皆常駐) */}
            <a
              href="../"
              className="flex items-center justify-center h-8 w-8 rounded-md text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-colors shrink-0"
              title="返回學校資訊系統首頁"
              aria-label="返回學校資訊系統首頁"
            >
              <Home className="w-4 h-4" />
            </a>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-600 truncate ml-0.5">
              <a
                href="../"
                className="text-slate-400 hover:text-teal-600 cursor-pointer hidden sm:inline"
                title="前往學校資訊系統首頁"
              >
                總首頁
              </a>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-slate-400 hidden md:inline truncate">
                數位學習平板系統
              </span>
              <span className="text-slate-300 hidden md:inline">/</span>
              <span className="font-semibold text-slate-800 truncate">
                {currentItem.label}
              </span>
            </div>
          </div>

          {/* 右側：更新時間與重新整理按鈕 */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {lastUpdated && (
              <span className="text-[11px] text-slate-400 hidden md:inline">
                更新於：{lastUpdated}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 sm:px-3 text-xs flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-500 ${
                  loading ? "animate-spin text-teal-600" : ""
                }`}
              />
              <span className="hidden sm:inline">
                {loading ? "更新中..." : "重新整理"}
              </span>
            </Button>
          </div>
        </header>

        {/* 錯誤警告橫條 */}
        {error && (
          <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 text-rose-700 hover:bg-rose-100"
              onClick={fetchData}
            >
              重試
            </Button>
          </div>
        )}

        {/* 核心內容視圖切換區塊 */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 flex flex-col min-h-0">
          {activeTab === "dashboard" && (
            <DashboardView
              tabletData={tabletData}
              cartData={cartData}
              loading={loading}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "tablets" && (
            <DataTable
              title="全校載具清單"
              allColumns={tabletColumns}
              data={tabletData}
              loading={loading}
              error={error}
              statusKey="設備狀態"
            />
          )}

          {activeTab === "carts" && (
            <DataTable
              title="全校移動平板車清單"
              allColumns={cartColumns}
              data={cartData}
              loading={loading}
              error={error}
              statusKey="狀態"
            />
          )}

          {activeTab === "classrooms" && <ClassroomView />}
        </div>
      </main>
    </div>
  );
}
