import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="print:hidden fixed top-0 left-0 right-0 z-30 h-12 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">Gray Cup Fast</span>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" className="text-xs text-gray-400 hover:text-gray-600">View Store </a>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer">Sign out</button>
          </form>
        </div>
      </nav>
      <div className="flex pt-12 h-screen">
        <Sidebar />
        <main className="flex-1 overflow-hidden p-6 ml-56 print:ml-0 print:p-0">{children}</main>
      </div>
    </>
  );
}
