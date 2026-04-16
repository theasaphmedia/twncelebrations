"use client"

import { useMembers, type Member } from "@/contexts/members-context"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Cake, Heart, Calendar, Eye, Plus, X, Gift, PartyPopper } from "lucide-react"
import { getDaysUntil, isToday, isThisMonth, formatDate } from "@/lib/date-utils"
import { useState, useEffect } from "react"

interface DashboardPageProps {
  onNavigateToMembers: () => void
  onNavigateToCards: (memberId?: string, type?: string) => void
}

interface CelebrationItem {
  member: Member
  type: "birthday" | "anniversary" | "babyDedication"
  date: { day: number; month: number }
  daysUntil: number
}

function AnimatedCounter({ value, delay = 0 }: { value: number; delay?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const duration = 1000
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * value))
        if (progress < 1) requestAnimationFrame(animate)
        else setCount(value)
      }

      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return <span>{count}</span>
}

function StatCard({
  title,
  value,
  icon: Icon,
  index = 0,
}: {
  title: string
  value: number
  icon: React.ElementType
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-2xl p-5 relative overflow-hidden group card-glow"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent" />

      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <p className="text-xs font-medium text-[#C9A84C]/80 tracking-[0.15em] uppercase mb-3">
        {title}
      </p>

      <div className="flex items-end justify-between">
        <span className="text-5xl font-bold text-gradient-gold tabular-nums">
          <AnimatedCounter value={value} delay={index * 100 + 300} />
        </span>
        <div className="relative">
          <div className="absolute -inset-3 bg-[#C9A84C]/10 rounded-full blur-lg group-hover:bg-[#C9A84C]/20 transition-all" />
          <div className="relative p-3 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30">
            <Icon className="w-6 h-6 text-[#C9A84C]" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function DashboardPage({ onNavigateToMembers, onNavigateToCards }: DashboardPageProps) {
  const { members } = useMembers()
  const [dismissedCelebrations, setDismissedCelebrations] = useState<string[]>([])

  const getCelebrations = (): CelebrationItem[] => {
    const celebrations: CelebrationItem[] = []

    members.forEach((member) => {
      if (member.birthday) {
        celebrations.push({ member, type: "birthday", date: member.birthday, daysUntil: getDaysUntil(member.birthday) })
      }
      if (member.anniversary) {
        celebrations.push({ member, type: "anniversary", date: member.anniversary, daysUntil: getDaysUntil(member.anniversary) })
      }
      if (member.babyDedication) {
        celebrations.push({ member, type: "babyDedication", date: member.babyDedication, daysUntil: getDaysUntil(member.babyDedication) })
      }
    })

    return celebrations.sort((a, b) => a.daysUntil - b.daysUntil)
  }

  const celebrations = getCelebrations()
  const todayCelebrations = celebrations.filter((c) => isToday(c.date))
  const next7Days = celebrations.filter((c) => c.daysUntil <= 7 && c.daysUntil > 0)
  const next30Days = celebrations.filter((c) => c.daysUntil <= 30)
  const birthdaysThisMonth = celebrations.filter((c) => c.type === "birthday" && isThisMonth(c.date))
  const anniversariesThisMonth = celebrations.filter((c) => c.type === "anniversary" && isThisMonth(c.date))

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "birthday": return "Birthday"
      case "anniversary": return "Anniversary"
      case "babyDedication": return "Baby Dedication"
      default: return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "birthday": return <Cake className="w-4 h-4" />
      case "anniversary": return <Heart className="w-4 h-4" />
      case "babyDedication": return <Gift className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getRowStyle = (daysUntil: number) => {
    if (daysUntil === 0) return "bg-gradient-to-r from-[#C9A84C]/20 via-[#C9A84C]/10 to-transparent border-l-[#C9A84C]"
    if (daysUntil <= 3) return "bg-gradient-to-r from-amber-500/10 to-transparent border-l-amber-500"
    return "border-l-transparent hover:border-l-[#C9A84C]/50"
  }

  const dismissCelebration = (id: string) => setDismissedCelebrations((prev) => [...prev, id])
  const visibleTodayCelebrations = todayCelebrations.filter(
    (c) => !dismissedCelebrations.includes(`${c.member.id}-${c.type}`)
  )

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 relative">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-[400px] h-[400px] rounded-full animate-float-orb"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)", filter: "blur(40px)" }}
        />
        <div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full animate-float-orb-reverse"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)", filter: "blur(50px)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative">

        {/* Today's Celebrations Alert */}
        <AnimatePresence>
          {visibleTodayCelebrations.length > 0 && (
            <motion.div
              className="relative overflow-hidden rounded-2xl"
              initial={{ opacity: 0, y: -50, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -50, height: 0 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4B85E] via-[#C9A84C] to-[#a8873a]" />

              {/* Sparkles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/40 rounded-full"
                    style={{ left: `${8 + i * 8}%`, top: `${20 + (i % 3) * 30}%` }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                    transition={{ duration: 2, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>

              <div className="relative p-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="p-3 bg-[#1A2E1A]/20 rounded-xl backdrop-blur-sm"
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <PartyPopper className="w-8 h-8 text-[#1A2E1A]" />
                  </motion.div>
                  <div>
                    <p className="font-bold text-[#1A2E1A] text-lg">{"Today's Celebrations!"}</p>
                    <p className="text-[#1A2E1A]/80 mt-0.5">
                      {visibleTodayCelebrations.map((c) => c.member.name).join(", ")}
                      {visibleTodayCelebrations.length === 1
                        ? ` is celebrating a ${getTypeLabel(visibleTodayCelebrations[0].type).toLowerCase()} today!`
                        : " are celebrating today!"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => visibleTodayCelebrations.forEach((c) => dismissCelebration(`${c.member.id}-${c.type}`))}
                  className="text-[#1A2E1A] hover:bg-[#1A2E1A]/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Members" value={members.length} icon={Users} index={0} />
          <StatCard title="Birthdays This Month" value={birthdaysThisMonth.length} icon={Cake} index={1} />
          <StatCard title="Anniversaries This Month" value={anniversariesThisMonth.length} icon={Heart} index={2} />
          <StatCard title="Upcoming (7 Days)" value={next7Days.length} icon={Calendar} index={3} />
        </div>

        {/* Quick Add */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Button
            onClick={onNavigateToMembers}
            className="bg-gradient-to-r from-[#C9A84C] to-[#a8873a] hover:from-[#D4B85E] hover:to-[#C9A84C] text-[#1A2E1A] font-bold shadow-lg btn-interactive px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </motion.div>

        {/* Upcoming Celebrations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass rounded-2xl overflow-hidden"
        >
          {/* Header gradient line */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30">
                <Calendar className="w-5 h-5 text-[#C9A84C]" />
              </div>
              <h2 className="text-gradient-gold text-xl font-bold">Upcoming Celebrations</h2>
              <span className="text-white/30 text-sm font-normal ml-auto">Next 30 Days</span>
            </div>

            {next30Days.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative inline-block mb-4">
                  <div className="absolute -inset-4 bg-[#C9A84C]/10 rounded-full blur-xl" />
                  <div className="relative w-20 h-20 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-[#C9A84C]/40" />
                  </div>
                </div>
                <p className="text-white/40 text-lg">No upcoming celebrations</p>
                <p className="text-white/25 text-sm mt-1">Add members to see their celebrations here</p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {next30Days.map((celebration, index) => (
                  <motion.div
                    key={`${celebration.member.id}-${celebration.type}`}
                    className={`flex items-center justify-between p-4 rounded-xl border-l-4 transition-all duration-300 table-row-interactive ${getRowStyle(celebration.daysUntil)}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {celebration.daysUntil === 0 && (
                          <div className="absolute -inset-1 bg-[#C9A84C]/40 rounded-full animate-pulse-ring" />
                        )}
                        {celebration.member.photo ? (
                          <img
                            src={celebration.member.photo}
                            alt={celebration.member.name}
                            className="relative w-12 h-12 rounded-full object-cover border-2 border-[#C9A84C]/40"
                          />
                        ) : (
                          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A84C]/30 to-[#C9A84C]/10 flex items-center justify-center border-2 border-[#C9A84C]/30">
                            <span className="text-[#C9A84C] font-bold text-lg">
                              {celebration.member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-white font-medium flex items-center gap-2">
                          {celebration.member.name}
                          {celebration.daysUntil === 0 && (
                            <motion.span
                              animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <Gift className="w-4 h-4 text-[#C9A84C]" />
                            </motion.span>
                          )}
                        </p>
                        <p className="text-white/40 text-sm flex items-center gap-2">
                          <span className="text-[#C9A84C]/60">{getTypeIcon(celebration.type)}</span>
                          {getTypeLabel(celebration.type)} - {formatDate(celebration.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                          celebration.daysUntil === 0
                            ? "bg-gradient-to-r from-[#C9A84C] to-[#a8873a] text-[#1A2E1A] shadow-lg"
                            : celebration.daysUntil <= 3
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20"
                        }`}
                      >
                        {celebration.daysUntil === 0
                          ? "Today!"
                          : celebration.daysUntil === 1
                          ? "Tomorrow"
                          : `${celebration.daysUntil} days`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigateToCards(celebration.member.id, celebration.type)}
                        className="text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-full btn-interactive"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}