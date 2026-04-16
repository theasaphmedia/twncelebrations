"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginPage } from "./login-page"
import { AppHeader } from "./app-header"
import { DashboardPage } from "./dashboard-page"
import { MembersPage } from "./members-page"
import { CardPreviewPage } from "./card-preview-page"
import { UsersPage } from "./users-page"

export function TWNApp() {
  const { isAuthenticated, role } = useAuth()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [cardPreviewMember, setCardPreviewMember] = useState<string | undefined>()
  const [cardPreviewType, setCardPreviewType] = useState<string | undefined>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [pageKey, setPageKey] = useState(0)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
    setPageKey(prev => prev + 1)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-atmospheric flex items-center justify-center overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full animate-float-orb pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)",
            top: "-10%",
            right: "-10%",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-float-orb-reverse pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(26,46,26,0.4) 0%, transparent 70%)",
            bottom: "-10%",
            left: "-10%",
          }}
        />
        <div className="glass rounded-2xl px-12 py-8 flex flex-col items-center gap-4 animate-fade-slide-up">
          <div
            className="w-16 h-16 rounded-full border-2 animate-heartbeat"
            style={{ borderColor: "rgba(201,168,76,0.6)" }}
          />
          <p className="text-gradient-gold text-lg font-bold tracking-widest uppercase">
            Loading...
          </p>
          <p className="text-[#C9A84C] text-xs uppercase tracking-widest opacity-60">
            The Worship Nation
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => handlePageChange("dashboard")} />
  }

  const handleNavigateToCards = (memberId?: string, type?: string) => {
    setCardPreviewMember(memberId)
    setCardPreviewType(type)
    handlePageChange("cards")
  }

  return (
    <div className="min-h-screen bg-atmospheric relative overflow-x-hidden">

      {/* Global floating orbs */}
      <div
        className="fixed w-[700px] h-[700px] rounded-full animate-float-orb pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
          top: "-15%",
          right: "-15%",
        }}
      />
      <div
        className="fixed w-[600px] h-[600px] rounded-full animate-float-orb-reverse pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(26,46,26,0.35) 0%, transparent 70%)",
          bottom: "-15%",
          left: "-15%",
        }}
      />

      {/* Header */}
      <div className="relative z-10">
        <AppHeader
          currentPage={currentPage}
          onPageChange={handlePageChange}
          role={role}
        />
      </div>

      {/* Page content */}
      <main
        key={pageKey}
        className="relative z-10 animate-fade-slide-up"
        style={{ animationDuration: "0.4s" }}
      >
        {currentPage === "dashboard" && (
          <DashboardPage
            onNavigateToMembers={() => handlePageChange("members")}
            onNavigateToCards={handleNavigateToCards}
          />
        )}
        {currentPage === "members" && <MembersPage />}
        {currentPage === "cards" && (
          <CardPreviewPage
            initialMemberId={cardPreviewMember}
            initialType={cardPreviewType}
          />
        )}
        {currentPage === "users" && role === "admin" && <UsersPage />}
      </main>
    </div>
  )
}