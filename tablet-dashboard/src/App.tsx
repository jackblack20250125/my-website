import StatsSummary from "./components/StatsSummary";
import TabletData from "./components/TabletData";
import CartData from "./components/CartData";
import ClassroomData from "./components/ClassroomData";

export default function App() {
  return (
    <div className="min-h-screen flex" style={{ height: "100vh" }}>
      {/* Left Sidebar - Navigation */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col p-4 space-y-2 overflow-y-auto shrink-0">
        <h1 className="text-lg font-bold mb-4 text-center">數位學習平板系統</h1>
        <NavItem label="Dashboard" active />
        <NavItem label="平板資料" />
        <NavItem label="平板車資料" />
        <NavItem label="教室資料" />
      </aside>
      {/* Right Main Area */}
      <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
        <div className="space-y-6">
          <StatsSummary />
          <TabletData />
          <CartData />
          <ClassroomData />
        </div>
      </main>
    </div>
  );
}

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className={`px-3 py-2 rounded cursor-pointer text-sm ${active ? "bg-teal-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}>
      {label}
    </div>
  );
}
