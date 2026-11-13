import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";

const API_URL = "https://script.google.com/macros/s/AKfycbyc3bZR6ckFHinD11MpZ1oe8G-X7U4T6jcMhQK52wIfEa4PrjWapAZ1PHrjQjBZCtr7/exec";
const TABLET_SHEET = "平板資料";
const CART_SHEET = "平板車資料";

export default function StatsSummary() {
  const [tabletStats, setTabletStats] = useState<any>(null);
  const [cartStats, setCartStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSheet = (sheetName: string) =>
      fetch(`${API_URL}?sheetName=${encodeURIComponent(sheetName)}`).then((r) => r.json());
    Promise.all([fetchSheet(TABLET_SHEET), fetchSheet(CART_SHEET)])
      .then(([tabletRes, cartRes]) => {
        const process = (json: any, idKey: string, statusKey: string) => {
          const rows: any[] = json.data || [];
          const data = rows.filter((r: any) => r[idKey]);
          const total = data.length;
          const normal = data.filter((r: any) => r[statusKey] === "正常").length;
          const inUse = data.filter((r: any) => r[statusKey] === "借出").length;
          const bad = total - normal - inUse;
          return { total, normal, inUse, bad };
        };
        setTabletStats(process(tabletRes, "設備ID", "設備狀態"));
        setCartStats(process(cartRes, "平板車ID編號", "狀態"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card className="shadow-sm border-teal-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-slate-500">載具總覽</CardTitle>
        <CheckCircle2 className="h-4 w-4 text-teal-500" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <Skeleton className="h-7 w-48" />
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>平板總數: {tabletStats?.total ?? 0}</div>
            <div>平板車總數: {cartStats?.total ?? 0}</div>
            <div>平板正常: {tabletStats?.normal ?? 0}</div>
            <div>平板車妥善可用: {cartStats?.normal ?? 0}</div>
            <div>平板借出: {tabletStats?.inUse ?? 0}</div>
            <div>平板車在用: {cartStats?.inUse ?? 0}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
