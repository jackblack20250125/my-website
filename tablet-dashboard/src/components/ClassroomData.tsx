import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function ClassroomData() {
  return (
    <Card className="shadow-sm border-teal-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-slate-500">教室資料</CardTitle>
        <CheckCircle2 className="h-4 w-4 text-teal-500" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-center text-gray-400 text-sm py-4">教室資料尚未實作</div>
      </CardContent>
    </Card>
  );
}
