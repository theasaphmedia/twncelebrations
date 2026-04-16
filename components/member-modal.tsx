"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { type Member } from "@/contexts/members-context"
import { X, User } from "lucide-react"

interface MemberModalProps {
  open: boolean
  onClose: () => void
  onSave: (member: Omit<Member, "id">) => void
  member?: Member | null
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function MemberModal({ open, onClose, onSave, member }: MemberModalProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [birthdayDay, setBirthdayDay] = useState("")
  const [birthdayMonth, setBirthdayMonth] = useState("")
  const [anniversaryDay, setAnniversaryDay] = useState("")
  const [anniversaryMonth, setAnniversaryMonth] = useState("")
  const [babyDedicationDay, setBabyDedicationDay] = useState("")
  const [babyDedicationMonth, setBabyDedicationMonth] = useState("")
  const [cellGroup, setCellGroup] = useState("")
  const [photo, setPhoto] = useState("")

  useEffect(() => {
    if (member) {
      setName(member.name)
      setPhone(member.phone || "")
      setBirthdayDay(member.birthday?.day.toString() || "")
      setBirthdayMonth(member.birthday?.month.toString() || "")
      setAnniversaryDay(member.anniversary?.day.toString() || "")
      setAnniversaryMonth(member.anniversary?.month.toString() || "")
      setBabyDedicationDay(member.babyDedication?.day.toString() || "")
      setBabyDedicationMonth(member.babyDedication?.month.toString() || "")
      setCellGroup(member.cellGroup || "")
      setPhoto(member.photo || "")
    } else {
      setName("")
      setPhone("")
      setBirthdayDay("")
      setBirthdayMonth("")
      setAnniversaryDay("")
      setAnniversaryMonth("")
      setBabyDedicationDay("")
      setBabyDedicationMonth("")
      setCellGroup("")
      setPhoto("")
    }
  }, [member, open])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const memberData: Omit<Member, "id"> = {
      name,
      phone: phone || undefined,
      birthday: birthdayDay && birthdayMonth
        ? { day: parseInt(birthdayDay), month: parseInt(birthdayMonth) }
        : undefined,
      anniversary: anniversaryDay && anniversaryMonth
        ? { day: parseInt(anniversaryDay), month: parseInt(anniversaryMonth) }
        : undefined,
      babyDedication: babyDedicationDay && babyDedicationMonth
        ? { day: parseInt(babyDedicationDay), month: parseInt(babyDedicationMonth) }
        : undefined,
      cellGroup: cellGroup || undefined,
      photo: photo || undefined,
    }
    onSave(memberData)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent
            className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 border-0"
            style={{
              background: "rgba(6, 14, 6, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(201, 168, 76, 0.35)",
              boxShadow: "0 0 60px rgba(201,168,76,0.12), 0 25px 50px rgba(0,0,0,0.6)",
            }}
          >
            {/* Top gradient line */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              className="p-6"
            >
              <DialogHeader>
                <DialogTitle className="text-gradient-gold text-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30">
                    <User className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  {member ? "Edit Member" : "Add New Member"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5 mt-6">

                {/* Photo Upload */}
                <motion.div
                  className="flex flex-col items-center gap-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {photo ? (
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-[#C9A84C]/20 rounded-full blur-md group-hover:bg-[#C9A84C]/30 transition-all" />
                      <img
                        src={photo}
                        alt="Preview"
                        className="relative w-28 h-28 rounded-full object-cover border-4 border-[#C9A84C]/50"
                      />
                      <button
                        type="button"
                        onClick={() => setPhoto("")}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full p-1.5 shadow-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="relative group cursor-pointer">
                      <div className="absolute -inset-2 bg-[#C9A84C]/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-all" />
                      <div className="relative w-28 h-28 rounded-full bg-black/30 border-2 border-dashed border-[#C9A84C]/30 flex flex-col items-center justify-center group-hover:border-[#C9A84C] transition-all">
                        <div className="p-2 rounded-full bg-[#C9A84C]/10 mb-2">
                          <User className="w-6 h-6 text-[#C9A84C]/60" />
                        </div>
                        <span className="text-xs text-white/40 group-hover:text-[#C9A84C] transition-colors">Add Photo</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </motion.div>

                {/* Name */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className="label-gold block">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-dark w-full h-11 rounded-xl text-white px-4"
                    placeholder="Enter full name"
                    required
                  />
                </motion.div>

                {/* Phone */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="label-gold block">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-dark w-full h-11 rounded-xl text-white px-4"
                    placeholder="Enter phone number"
                  />
                </motion.div>

                {/* Birthday */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="label-gold block">Birthday</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={birthdayDay}
                      onChange={(e) => setBirthdayDay(e.target.value)}
                      className="input-dark w-20 h-11 rounded-xl text-white px-4"
                      placeholder="Day"
                    />
                    <select
                      value={birthdayMonth}
                      onChange={(e) => setBirthdayMonth(e.target.value)}
                      className="flex-1 input-dark h-11 rounded-xl px-4 text-white appearance-none cursor-pointer"
                    >
                      <option value="">Select Month</option>
                      {MONTHS.map((month, index) => (
                        <option key={month} value={index + 1}>{month}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>

                {/* Anniversary */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="label-gold block">Wedding Anniversary</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={anniversaryDay}
                      onChange={(e) => setAnniversaryDay(e.target.value)}
                      className="input-dark w-20 h-11 rounded-xl text-white px-4"
                      placeholder="Day"
                    />
                    <select
                      value={anniversaryMonth}
                      onChange={(e) => setAnniversaryMonth(e.target.value)}
                      className="flex-1 input-dark h-11 rounded-xl px-4 text-white appearance-none cursor-pointer"
                    >
                      <option value="">Select Month</option>
                      {MONTHS.map((month, index) => (
                        <option key={month} value={index + 1}>{month}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>

                {/* Baby Dedication */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="label-gold block">Baby Dedication Date</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={babyDedicationDay}
                      onChange={(e) => setBabyDedicationDay(e.target.value)}
                      className="input-dark w-20 h-11 rounded-xl text-white px-4"
                      placeholder="Day"
                    />
                    <select
                      value={babyDedicationMonth}
                      onChange={(e) => setBabyDedicationMonth(e.target.value)}
                      className="flex-1 input-dark h-11 rounded-xl px-4 text-white appearance-none cursor-pointer"
                    >
                      <option value="">Select Month</option>
                      {MONTHS.map((month, index) => (
                        <option key={month} value={index + 1}>{month}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>

                {/* Cell Group */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="label-gold block">Cell Group / Department</label>
                  <input
                    value={cellGroup}
                    onChange={(e) => setCellGroup(e.target.value)}
                    className="input-dark w-full h-11 rounded-xl text-white px-4"
                    placeholder="Enter cell group or department"
                  />
                </motion.div>

                {/* Divider */}
                <div className="gold-line my-6" />

                {/* Actions */}
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 border-[#C9A84C]/30 text-white hover:bg-[#C9A84C]/10 hover:border-[#C9A84C] h-11 rounded-xl transition-all btn-interactive"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#C9A84C] to-[#a8873a] hover:from-[#D4B85E] hover:to-[#C9A84C] text-[#1A2E1A] font-bold h-11 rounded-xl shadow-lg btn-interactive"
                  >
                    {member ? "Update Member" : "Add Member"}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}