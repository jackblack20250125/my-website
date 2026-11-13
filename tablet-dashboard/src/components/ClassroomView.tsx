import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { School, CheckCircle2, Clock, Sparkles } from "lucide-react";

export default function ClassroomView() {
  return (
    <div className="space-y-5 pb-6">
      {/* 模組狀態資訊卡 */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <School className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800">
                第四格：教室資料管理模組
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                各班級與專科教室之平板借還、固定充電車配置與空間盤點功能
              </p>
            </div>
          </div>
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 font-normal text-xs">
            <Clock className="w-3 h-3 mr-1" /> 建置規劃中
          </Badge>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70">
              <div className="font-semibold text-xs text-slate-700 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> 1. 普通班級配置
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                預計整合各年級普通班（國一、國二、國三等）班級置放平板數量與保管人資訊。
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70">
              <div className="font-semibold text-xs text-slate-700 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> 2. 專科/電腦教室
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                記錄專科教室、創客教室、科技中心之固定設備與隨車支援數量。
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70">
              <div className="font-semibold text-xs text-slate-700 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> 3. 預約與借用紀錄
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                預留與 Google Calendar 或線上簽核對接，掌握全校教室即時借還動態。
              </p>
            </div>
          </div>

          {/* 未來第5格、第6格擴充指引 */}
          <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-800">
                模組擴充架構說明（支援第 5 格、第 6 格...）
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                系統已採用模組化路由設計。當你有新的功能想加入（如「報修追蹤」、「盤點紀錄」或「耗材管理」），只需在{" "}
                <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-[11px]">
                  src/types.ts
                </code>{" "}
                的選單配置中新增項目，並建立對應內容視圖，左側側欄便會自動加入新格位並支援無縫切換！
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
