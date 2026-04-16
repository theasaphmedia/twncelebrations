"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, User } from "lucide-react"

interface AppHeaderProps {
  currentPage: string
  onPageChange: (page: string) => void
  role?: string | null
}

export function AppHeader({ currentPage, onPageChange, role }: AppHeaderProps) {
  const { user, logout } = useAuth()

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "members", label: "Members" },
    { id: "cards", label: "Card Preview" },
    ...(role === "admin" ? [{ id: "users", label: "Users" }] : []),
  ]

  return (
    <motion.header
      className="glass-subtle sticky top-0 z-50 border-b border-[#C9A84C]/20"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Animated top border */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo section */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-2 bg-[#C9A84C]/0 group-hover:bg-[#C9A84C]/10 rounded-xl blur transition-all duration-300" />
              <Image
                src="/images/twn-logo.png"
                alt="The Worship Nation"
                width={140}
                height={40}
                className="relative"
                priority
              />
            </div>

            <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-[#C9A84C]/30 to-transparent" />

            <div className="hidden sm:block">
              <h1 className="text-gradient-gold-simple font-bold text-lg tracking-wide">
                Celebrations Hub
              </h1>
            </div>
          </motion.div>

          {/* Desktop navigation */}
          <motion.nav
            className="hidden md:flex items-center gap-1 glass-gold rounded-xl p-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === item.id
                    ? "bg-gradient-to-r from-[#C9A84C] to-[#a8873a] text-[#1A2E1A] shadow-lg"
                    : "text-white/70 hover:text-[#C9A84C] nav-item-interactive"
                }`}
              >
                {currentPage === item.id && (
                  <motion.span
                    className="absolute inset-0 animate-shimmer rounded-lg"
                    layoutId="navHighlight"
                  />
                )}
                <span className="relative">{item.label}</span>
              </button>
            ))}
          </motion.nav>

          {/* User section */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div className="hidden sm:flex items-center gap-2 text-white/60 glass-subtle px-3 py-1.5 rounded-full">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#a8873a] flex items-center justify-center">
                <User className="w-3 h-3 text-[#1A2E1A]" />
              </div>
              <span className="text-sm text-white/80">{user}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1A2E1A] hover:border-[#C9A84C] transition-all duration-300 btn-interactive group"
            >
              <LogOut className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </motion.div>
        </div>

        {/* Mobile navigation */}
        <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                currentPage === item.id
                  ? "bg-gradient-to-r from-[#C9A84C] to-[#a8873a] text-[#1A2E1A] shadow-lg"
                  : "text-white/70 hover:text-[#C9A84C] glass-subtle"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </motion.header>
  )
}