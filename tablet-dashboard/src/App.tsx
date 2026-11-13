import { useState, useEffect, useCallback } from "react";
import { API_URL, TABLET_SHEET, CART_SHEET } from "./config";
import { tabletColumns, cartColumns, MENU_ITEMS } from "./types";
import DashboardView from "./components/DashboardView";
import DataTable from "./components/DataTable";
import ClassroomView from "./components/ClassroomView";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Tablet,
  Bus,
  School,
  RefreshCw,
  ChevronRight,
  User,
  Layers,
  AlertTriangle,
  Radio,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tabletData, setTabletData] = useState<any[]>([]);
  const [cartData, setCartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

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

      // 排除無設備ID或空白的列
      const cleanTablets = tablets.filter(
        (r: any) => String(r["設備ID"] || "").trim() !== ""
      );
      const cleanCarts = carts.filter(
        (r: any) => String(r["平板車ID編號"] || "").trim() !== ""
      );

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

  return (
    <div className="flex h-screen w-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* ── 左側選單側欄（深色主題，風格參考使用者截圖） ────────────────────── */}
      <aside className="w-60 sm:w-64 bg-[#2b2f33] text-slate-200 flex flex-col shrink-0 border-r border-[#222528] shadow-md z-30 select-none">
        {/* 系統標題 / Logo 區塊 */}
        <div className="h-14 border-b border-[#383d42] px-4 flex items-center justify-between bg-[#222528]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-sm tracking-tight shadow-sm">
              <Tablet className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white">
                數位學習平板系統
              </div>
              <div className="text-[10px] text-teal-400">高雄市路竹高中</div>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="雲端資料庫連線中" />
        </div>

        {/* 使用者身份資訊卡 (如圖中 Ichs 路竹高中) */}
        <div className="px-4 py-3 border-b border-[#383d42] bg-[#282c30]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-600 border border-slate-500 flex items-center justify-center text-slate-200 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="font-medium text-xs text-white truncate">
                Ichs (路竹高中)
              </div>
              <div className="text-[11px] text-slate-400">資訊組管理員</div>
            </div>
          </div>
        </div>

        {/* 導覽選單項目列表 */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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
                  {/* 動態筆數標籤 */}
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

        {/* 側欄底部資訊 */}
        <div className="p-3 border-t border-[#383d42] bg-[#222528] text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>GAS API 連動</span>
          </div>
          <span className="text-[10px] text-slate-500">v2.6</span>
        </div>
      </aside>

      {/* ── 右側主要工作區域（大版面） ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 min-w-0">
        {/* 頂部功能與路徑導覽列 (Breadcrumbs + 重新整理) */}
        <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0 shadow-sm z-20">
          {/* Breadcrumb 路徑導覽 (如圖中 Home / 系統管理 / 領域資訊) */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
              首頁
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">數位學習平板系統</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800">
              {currentItem.label}
            </span>
          </div>

          {/* 右側：資料狀態與重新整理按鈕 */}
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                最後更新：{lastUpdated}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-500 ${
                  loading ? "animate-spin text-teal-600" : ""
                }`}
              />
              <span>{loading ? "更新中..." : "重新整理"}</span>
            </Button>
          </div>
        </header>

        {/* 錯誤警告橫條 */}
        {error && (
          <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-5 py-2.5 flex items-center justify-between text-xs shrink-0">
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col min-h-0">
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
