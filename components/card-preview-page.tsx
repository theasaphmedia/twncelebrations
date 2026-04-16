"use client"

import { useState, useRef, useEffect } from "react"
import { useMembers } from "@/contexts/members-context"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Download, Image as ImageIcon, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/date-utils"
import html2canvas from "html2canvas"

interface CardPreviewPageProps {
  initialMemberId?: string
  initialType?: string
}

type CelebrationType = "birthday" | "anniversary" | "babyDedication"

export function CardPreviewPage({ initialMemberId, initialType }: CardPreviewPageProps) {
  const { members } = useMembers()
  const cardRef = useRef<HTMLDivElement>(null)
  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId || "")
  const [celebrationType, setCelebrationType] = useState<CelebrationType>(
    (initialType as CelebrationType) || "birthday"
  )
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (initialMemberId) setSelectedMemberId(initialMemberId)
    if (initialType) setCelebrationType(initialType as CelebrationType)
  }, [initialMemberId, initialType])

  const selectedMember = members.find((m) => m.id === selectedMemberId)

  const getDate = () => {
    if (!selectedMember) return undefined
    switch (celebrationType) {
      case "birthday": return selectedMember.birthday
      case "anniversary": return selectedMember.anniversary
      case "babyDedication": return selectedMember.babyDedication
    }
  }

  const date = getDate()

  const downloadCard = async () => {
    if (!cardRef.current || !selectedMember) return
    setIsDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      })
      const link = document.createElement("a")
      link.download = `${selectedMember.name}-${celebrationType}-card.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Error downloading card:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full animate-float-orb"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)", filter: "blur(50px)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full animate-float-orb-reverse"
          style={{ background: "radial-gradient(circle, rgba(26,46,26,0.2) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative">

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30">
                <ImageIcon className="w-5 h-5 text-[#C9A84C]" />
              </div>
              <h2 className="text-gradient-gold text-xl font-bold">Create Celebration Card</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="label-gold block">Select Member</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full input-dark rounded-xl px-4 py-3 text-white appearance-none cursor-pointer"
                >
                  <option value="">Choose a member...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="label-gold block">Celebration Type</label>
                <select
                  value={celebrationType}
                  onChange={(e) => setCelebrationType(e.target.value as CelebrationType)}
                  className="w-full input-dark rounded-xl px-4 py-3 text-white appearance-none cursor-pointer"
                >
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Wedding Anniversary</option>
                  <option value="babyDedication">Baby Dedication</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card Preview */}
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="relative">
            <div className="absolute -inset-6 bg-[#1A2E1A]/40 rounded-3xl blur-2xl" />

            {/* CARD */}
            <div
              ref={cardRef}
              className="relative overflow-hidden rounded-2xl shadow-2xl"
              style={{ width: "360px", height: "450px" }}
            >
              {/* LAYER 1 — Member photo behind template */}
              {selectedMember?.photo ? (
                <img
                  src={selectedMember.photo}
                  alt={selectedMember.name}
                  style={{
                    position: "absolute",
                    left: "22%",
                    top: "28%",
                    width: "48%",
                    height: "58%",
                    objectFit: "cover",
                    zIndex: 1,
                  }}
                />
              ) : (
                <div style={{
                  position: "absolute",
                  left: "22%",
                  top: "28%",
                  width: "48%",
                  height: "58%",
                  zIndex: 1,
                  background: "linear-gradient(135deg, rgba(201,168,76,0.3), rgba(26,46,26,0.5))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{ color: "#C9A84C", fontSize: "48px", fontWeight: "bold" }}>
                    {selectedMember?.name?.charAt(0) || "?"}
                  </span>
                </div>
              )}

              {/* LAYER 2 — Template PNG on top */}
              <img
                src="/images/twn-birthday-template.png"
                alt="Card Template"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  zIndex: 2,
                }}
              />

              {/* LAYER 3 — Date & Name */}
              <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
                {date && (
                  <div style={{
                    position: "absolute",
                    top: "5%",
                    right: "3%",
                    background: "white",
                    color: "#1A2E1A",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "70px",
                    height: "32px",
                  }}>
                    {formatDate(date)}
                  </div>
                )}

                {/* Member Name */}
                <div style={{
                  position: "absolute",
                  bottom: "8%",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                }}>
                  <p style={{
                    color: "white",
                    fontSize: "18px",
                    fontWeight: "bold",
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                    letterSpacing: "0.05em",
                  }}>
                    {selectedMember?.name || ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={downloadCard}
            disabled={!selectedMember || isDownloading}
            className="bg-gradient-to-r from-[#C9A84C] to-[#a8873a] hover:from-[#D4B85E] hover:to-[#C9A84C] text-[#1A2E1A] font-bold px-10 py-6 rounded-xl shadow-lg btn-interactive disabled:opacity-50"
          >
            {isDownloading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</>
            ) : (
              <><Download className="w-5 h-5 mr-2" />Download Card as PNG</>
            )}
          </Button>

          <p className="text-white/30 text-xs text-center">
            Select a member with a photo to preview the card
          </p>
        </motion.div>

        {members.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-8 text-center"
          >
            <ImageIcon className="w-10 h-10 text-[#C9A84C]/40 mx-auto mb-4" />
            <p className="text-white/40 text-lg">No members added yet.</p>
            <p className="text-sm mt-1 text-white/25">Go to the Members page to add members first.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}