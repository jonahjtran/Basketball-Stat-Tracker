import './globals.css'
import Link from 'next/link'
import { Circle, Home, Users, Calendar, Menu, X, BarChart3, Plus } from 'lucide-react'

export const metadata = {
  title: 'Basketball Stat Tracker',
  description: 'Track basketball player stats, games, and performance analytics',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
        {/* Modern Navigation */}
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <Circle className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Basketball Stats
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  href="/analytics" 
                  className="flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
                <Link 
                  href="/new-game" 
                  className="flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Game</span>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-in">
            {children}
          </div>
        </main>

        {/* Modern Footer */}
        <footer className="border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Circle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-500">
                  Basketball Stat Tracker
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <span>© 2025 Basketball Stats</span>
                <span>•</span>
                <span>Built with Next.js & TailwindCSS</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
