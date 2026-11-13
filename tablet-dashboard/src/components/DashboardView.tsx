import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Laptop,
  Bus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";

interface DashboardViewProps {
  tabletData: any[];
  cartData: any[];
  loading: boolean;
  onNavigate: (pageId: string) => void;
}

export default function DashboardView({
  tabletData,
  cartData,
  loading,
  onNavigate,
}: DashboardViewProps) {
  // 平板統計
  const tabletStats = useMemo(() => {
    const total = tabletData.length;
    const available = tabletData.filter((d) =>
      ["在庫", "可借用", "正常"].some((s) => String(d["設備狀態"] || "").includes(s))
    ).length;
    const inUse = tabletData.filter((d) =>
      ["借出", "借出中", "出借"].some((s) => String(d["設備狀態"] || "").includes(s))
    ).length;
    const repairing = tabletData.filter((d) =>
      ["維修", "報廢", "損壞", "故障"].some((s) => String(d["設備狀態"] || "").includes(s))
    ).length;
    return { total, available, inUse, repairing };
  }, [tabletData]);

  // 平板車統計（妥善可用、在用、異常）
  const cartStats = useMemo(() => {
    const total = cartData.length;
    const normal = cartData.filter((d) =>
      ["正常", "正常使用"].some((s) => String(d["狀態"] || "").includes(s))
    ).length;
    const inUse = cartData.filter((d) =>
      ["使用中", "借出"].some((s) => String(d["狀態"] || "").includes(s))
    ).length;
    const issue = total - normal - inUse;
    return { total, normal, inUse, issue };
  }, [cartData]);

  // 平板型號分佈
  const modelBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    tabletData.forEach((t) => {
      const model = String(t["型號"] || t["設備類型"] || "未指定型號").trim();
      counts[model] = (counts[model] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [tabletData]);

  // 計畫分佈
  const projectBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    tabletData.forEach((t) => {
      const p = String(t["相關計畫"] || "一般校產").trim();
      if (p) counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [tabletData]);

  // 妥善率百分比
  const tabletHealthRate = tabletStats.total > 0
    ? Math.round((tabletStats.available / tabletStats.total) * 100)
    : 0;

  const cartHealthRate = cartStats.total > 0
    ? Math.round((cartStats.normal / cartStats.total) * 100)
    : 0;

  return (
    <div className="space-y-5 pb-6">
      {/* 頂部系統狀態條 (風格參考 N-Cloud 7 領域資訊彩色進度條) */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <CardTitle className="text-sm font-semibold text-slate-800">
              全校資訊載具營運指標概況
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600">
            即時線上彙整
          </Badge>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {/* 平板妥善率長條 */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-blue-600" /> 載具整體妥善率
              </span>
              <span className="font-semibold text-blue-700">{tabletHealthRate}% ({tabletStats.available} / {tabletStats.total} 台)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${(tabletStats.available / (tabletStats.total || 1)) * 100}%` }}
                title={`妥善可用: ${tabletStats.available}`}
              />
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${(tabletStats.inUse / (tabletStats.total || 1)) * 100}%` }}
                title={`借出中: ${tabletStats.inUse}`}
              />
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${(tabletStats.repairing / (tabletStats.total || 1)) * 100}%` }}
                title={`維修故障: ${tabletStats.repairing}`}
              />
            </div>
          </div>

          {/* 平板車妥善率長條 */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-purple-600" /> 平板車妥善率
              </span>
              <span className="font-semibold text-purple-700">{cartHealthRate}% ({cartStats.normal} / {cartStats.total} 輛)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-teal-500 h-full transition-all duration-500"
                style={{ width: `${(cartStats.normal / (cartStats.total || 1)) * 100}%` }}
                title={`妥善可用: ${cartStats.normal}`}
              />
              <div
                className="bg-purple-500 h-full transition-all duration-500"
                style={{ width: `${(cartStats.inUse / (cartStats.total || 1)) * 100}%` }}
                title={`使用中: ${cartStats.inUse}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6 大統計指標卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* 卡片 1: 載具總數 */}
        <Card className="shadow-sm border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <CardTitle className="text-xs font-medium text-slate-600">載具總數</CardTitle>
            <Laptop className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3.5">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-slate-800">{tabletStats.total}</div>
            )}
            <p className="text-[11px] text-slate-500 mt-1">全校登記平板</p>
          </CardContent>
        </Card>

        {/* 卡片 2: 平板妥善可用 */}
        <Card className="shadow-sm border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <CardTitle className="text-xs font-medium text-slate-600">妥善可用</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3.5">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-emerald-600">{tabletStats.available}</div>
            )}
            <p className="text-[11px] text-emerald-600/80 mt-1">正常在校隨時可借</p>
          </CardContent>
        </Card>

        {/* 卡片 3: 目前借出 */}
        <Card className="shadow-sm border-sky-100 bg-gradient-to-br from-white to-sky-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <CardTitle className="text-xs font-medium text-slate-600">目前借出</CardTitle>
            <AlertCircle className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3.5">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-sky-600">{tabletStats.inUse}</div>
            )}
            <p className="text-[11px] text-sky-600/80 mt-1">各班或教師授課使用中</p>
          </CardContent>
        </Card>

        {/* 卡片 4: 維修/故障 */}
        <Card className="shadow-sm border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <CardTitle className="text-xs font-medium text-slate-600">維修/故障</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3.5">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">{tabletStats.repairing}</div>
            )}
            <p className="text-[11px] text-amber-600/80 mt-1">待報修或維護處理</p>
          </CardContent>
        </Card>

        {/* 卡片 5: 平板車總數 */}
        <Card className="shadow-sm border-purple-100 bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <CardTitle className="text-xs font-medium text-slate-600">平板車總數</CardTitle>
            <Bus className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3.5">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-purple-700">{cartStats.total}</div>
            )}
            <p className="text-[11px] text-purple-600/80 mt-1">移動充電收納車</p>
          </CardContent>
        </Card>

        {/* 卡片 6: 平板車妥善可用 */}
        <Card className="shadow-sm border-teal-100 bg-gradient-to-br from-white to-teal-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <CardTitle className="text-xs font-medium text-slate-600">妥善可用</CardTitle>
            <ShieldCheck className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3.5">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-teal-600">{cartStats.normal}</div>
            )}
            <p className="text-[11px] text-teal-600/80 mt-1">充電與配線正常運作</p>
          </CardContent>
        </Card>
      </div>

      {/* 下方雙欄資訊展示區 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 左側：平板車即時分佈與容量概況 */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="py-3.5 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-purple-600" />
              <CardTitle className="text-sm font-semibold text-slate-800">
                平板車配置分佈概況
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-purple-600 hover:text-purple-700 h-7 px-2"
              onClick={() => onNavigate("carts")}
            >
              檢視完整清單 <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {cartData.slice(0, 10).map((cart, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100/70 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-800">
                        {cart["平板車ID編號"] || `車輛 #${idx + 1}`}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {cart["所在班級"] || cart["放置位置"] || "未指定位置"}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[11px] font-normal border-purple-200 text-purple-700 bg-purple-50">
                        載具：{cart["載具數量"] || "0"} / {cart["設備容量"] || "-"}
                      </Badge>
                      <div className="text-[10px] text-emerald-600 mt-0.5">
                        {cart["狀態"] || "正常"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右側：載具規格與計畫分佈 */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="py-3.5 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm font-semibold text-slate-800">
                載具機型與計畫分類
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2"
              onClick={() => onNavigate("tablets")}
            >
              檢視完整清單 <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* 機型分佈 */}
            <div>
              <div className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> 主要機型配置
              </div>
              <div className="space-y-1.5">
                {modelBreakdown.slice(0, 4).map(([model, count]) => (
                  <div key={model} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-700 font-medium">{model}</span>
                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {count} 台
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* 計畫分類 */}
            <div>
              <div className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 相關專案計畫
              </div>
              <div className="flex flex-wrap gap-1.5">
                {projectBreakdown.map(([project, count]) => (
                  <Badge
                    key={project}
                    variant="outline"
                    className="text-xs font-normal border-slate-200 bg-white py-1 px-2 text-slate-700"
                  >
                    {project}: <strong className="ml-1 text-slate-900">{count}</strong>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
