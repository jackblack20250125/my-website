import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

const API_URL = "https://script.google.com/macros/s/AKfycbyc3bZR6ckFHinD11MpZ1oe8G-X7U4T6jcMhQK52wIfEa4PrjWapAZ1PHrjQjBZCtr7/exec";
const TABLET_SHEET = "平板資料";

const tabletColumns = [
  { key: "設備ID",       label: "設備ID",       defaultVisible: true,  filterable: true  },
  { key: "型號",         label: "型號",         defaultVisible: true,  filterable: true  },
  { key: "作業系統",     label: "作業系統",     defaultVisible: true,  filterable: true  },
  { key: "設備序號",     label: "設備序號",     defaultVisible: false, filterable: false },
  { key: "MAC位址",      label: "MAC位址",      defaultVisible: false, filterable: false },
  { key: "平板車ID",     label: "平板車ID",     defaultVisible: true,  filterable: true  },
  { key: "入校年度",     label: "入校年度",     defaultVisible: false, filterable: true  },
  { key: "購買日期",     label: "購買日期",     defaultVisible: false, filterable: false },
  { key: "保固到期日",   label: "保固到期日",   defaultVisible: false, filterable: false },
  { key: "最後盤點日期", label: "最後盤點日期", defaultVisible: true,  filterable: true  },
  { key: "設備狀態",     label: "設備狀態",     defaultVisible: true,  filterable: true  },
  { key: "相關計畫",     label: "相關計畫",     defaultVisible: true,  filterable: true  },
  { key: "使用年限",     label: "使用年限",     defaultVisible: false, filterable: true  },
  { key: "備註",         label: "備註",         defaultVisible: false, filterable: false },
];

export default function TabletData() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}?sheet=${TABLET_SHEET}`)
      .then((res) => res.json())
      .then((json) => {
        const rows = json.values || [];
        const header = rows[0] || [];
        const processed = rows.slice(1).map((row: any[]) => {
          const obj: any = {};
          header.forEach((col: string, i: number) => {
            obj[col] = (row[i] ?? "").trim();
          });
          return obj;
        }).filter((r: any) => r["設備ID"]);
        setData(processed);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const visibleColumns = tabletColumns.filter((c) => c.defaultVisible);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (search) {
        const match = tabletColumns.some((c) => {
          const val = row[c.key] ?? "";
          return val.toString().toLowerCase().includes(search.toLowerCase());
        });
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => {
      if (!sortKey) return 0;
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (sortAsc) return av > bv ? 1 : av < bv ? -1 : 0;
      return av < bv ? 1 : av > bv ? -1 : 0;
    });
  }, [data, search, sortKey, sortAsc]);

  return (
    <Card className="shadow-sm border-teal-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-slate-500">平板資料</CardTitle>
        <CheckCircle2 className="h-4 w-4 text-teal-500" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Input placeholder="搜尋..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-48" />
        </div>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-xs">
              <thead>
                <tr className="bg-gray-100">
                  {visibleColumns.map((col) => (
                    <th key={col.key} className="px-2 py-1 text-left cursor-pointer whitespace-nowrap" onClick={() => {
                      if (sortKey === col.key) setSortAsc(!sortAsc);
                      else { setSortKey(col.key); setSortAsc(true); }
                    }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="px-2 py-1 whitespace-nowrap">{row[col.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
