import DashboardStyle1 from "./components/DashboardStyle1";

export default function App() {
  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        <DashboardStyle1 />
      </main>
    </div>
  );
}
