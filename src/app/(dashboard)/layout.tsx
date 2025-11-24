import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
                <span className="text-xl font-bold">Deep Terminal</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Markets
                </Link>
                <Link
                  href="/screener"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Screener
                </Link>
                <Link
                  href="/charts"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Charts
                </Link>
                <Link
                  href="/portfolio"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Portfolio
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
