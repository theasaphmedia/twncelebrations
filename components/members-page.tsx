"use client"

import { useState, useCallback } from "react"
import { useMembers, type Member } from "@/contexts/members-context"
import { Button } from "@/components/ui/button"
import { MemberModal } from "./member-modal"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Search, Upload, Download, Trash2, Edit, Users, 
  FileText, X, Check, ChevronUp, ChevronDown
} from "lucide-react"
import { formatDate, parseDate } from "@/lib/date-utils"
import { useToast } from "@/hooks/use-toast"

export function MembersPage() {
  const { members, addMember, updateMember, deleteMember, importMembers } = useMembers()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<"name" | "cellGroup">("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [csvPreview, setCsvPreview] = useState<Omit<Member, "id">[] | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredMembers = members
    .filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.cellGroup?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = sortField === "name" ? a.name : (a.cellGroup || "")
      const bVal = sortField === "name" ? b.name : (b.cellGroup || "")
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })

  const handleSort = (field: "name" | "cellGroup") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const SortIcon = ({ field }: { field: "name" | "cellGroup" }) => {
    if (sortField !== field) return null
    return sortDir === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    setTimeout(() => {
      if (confirm("Are you sure you want to delete this member?")) {
        deleteMember(id)
        toast({ title: "Member deleted", description: "The member has been removed successfully." })
      }
      setDeletingId(null)
    }, 500)
  }

  const handleSave = (memberData: Omit<Member, "id">) => {
    if (editingMember) {
      updateMember(editingMember.id, memberData)
      toast({ title: "Member updated", description: "The member information has been updated." })
    } else {
      addMember(memberData)
      toast({ title: "Member added", description: "The new member has been added successfully." })
    }
    setEditingMember(null)
  }

  const parseCSV = (text: string): Omit<Member, "id">[] => {
    const lines = text.split("\n").filter((l) => l.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const nameIdx = headers.findIndex((h) => h === "name" || h === "full name")
    const phoneIdx = headers.findIndex((h) => h === "phone" || h === "phone number")
    const birthdayIdx = headers.findIndex((h) => h === "birthday" || h === "birth date")
    const anniversaryIdx = headers.findIndex((h) => h === "anniversary" || h === "wedding anniversary")
    const babyDedicationIdx = headers.findIndex((h) => h.includes("baby") || h.includes("dedication"))
    const cellGroupIdx = headers.findIndex((h) => h === "cell group" || h === "department" || h === "group")

    const result: Omit<Member, "id">[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      const name = nameIdx >= 0 ? values[nameIdx] : ""
      if (!name) continue

      const birthday = birthdayIdx >= 0 ? parseDate(values[birthdayIdx]) : null
      const anniversary = anniversaryIdx >= 0 ? parseDate(values[anniversaryIdx]) : null
      const babyDedication = babyDedicationIdx >= 0 ? parseDate(values[babyDedicationIdx]) : null

      result.push({
        name,
        phone: phoneIdx >= 0 ? values[phoneIdx] || undefined : undefined,
        birthday: birthday || undefined,
        anniversary: anniversary || undefined,
        babyDedication: babyDedication || undefined,
        cellGroup: cellGroupIdx >= 0 ? values[cellGroupIdx] || undefined : undefined,
      })
    }

    return result
  }

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith(".csv")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const parsed = parseCSV(text)
        if (parsed.length > 0) {
          setCsvPreview(parsed)
        } else {
          toast({ title: "Import failed", description: "Could not parse the CSV file.", variant: "destructive" })
        }
      }
      reader.readAsText(file)
    }
  }, [toast])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const parsed = parseCSV(text)
        if (parsed.length > 0) {
          setCsvPreview(parsed)
        } else {
          toast({ title: "Import failed", description: "Could not parse the CSV file.", variant: "destructive" })
        }
      }
      reader.readAsText(file)
    }
  }

  const confirmImport = async () => {
    if (csvPreview) {
      const count = await importMembers(csvPreview)
      toast({ title: "Import successful", description: `${count} members imported successfully.` })
      setCsvPreview(null)
    }
  }

  const downloadSampleCSV = () => {
    const csv = `Name,Phone,Birthday,Anniversary,Baby Dedication,Cell Group
John Doe,555-1234,14-Feb,25-Jun,,Youth Ministry
Jane Smith,555-5678,March 20,,,Women's Fellowship
Bob Johnson,555-9012,05/15,12/25,Jan 10,Men's Group`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "twn-members-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const headers = ["Name", "Phone", "Birthday", "Anniversary", "Baby Dedication", "Cell Group"]
    const rows = members.map((m) => [
      m.name,
      m.phone || "",
      m.birthday ? formatDate(m.birthday) : "",
      m.anniversary ? formatDate(m.anniversary) : "",
      m.babyDedication ? formatDate(m.babyDedication) : "",
      m.cellGroup || "",
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "twn-members-export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Shared column widths — applied to both header and data rows
  const col = {
    avatar: { flex: "0 0 56px", width: "56px" },
    name: { flex: "0 0 22%", minWidth: 0 },
    phone: { flex: "0 0 17%" },
    birthday: { flex: "0 0 13%" },
    anniversary: { flex: "0 0 13%" },
    cellGroup: { flex: "0 0 13%" },
    actions: { flex: "0 0 14%", textAlign: "right" as const },
  }

  const headerCell = "text-[#C9A84C] uppercase text-xs tracking-wider font-medium py-4 px-4"
  const dataCell = "text-white/50 text-sm py-4 px-4"

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-40 right-20 w-[400px] h-[400px] rounded-full animate-float-orb"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)", filter: "blur(50px)" }}
        />
        <div
          className="absolute bottom-40 left-20 w-[500px] h-[500px] rounded-full animate-float-orb-reverse"
          style={{ background: "radial-gradient(circle, rgba(26,46,26,0.2) 0%, transparent 70%)", filter: "blur(60px)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative">

        <motion.div
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-[#C9A84C] transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="input-dark w-full h-12 rounded-xl text-white placeholder:text-white/30 pl-11 pr-4"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={downloadSampleCSV}
              className="border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10 hover:border-[#C9A84C] transition-all btn-interactive rounded-xl"
            >
              <FileText className="w-4 h-4 mr-2" />
              Sample CSV
            </Button>
            <Button
              variant="outline"
              onClick={exportCSV}
              className="border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10 hover:border-[#C9A84C] transition-all btn-interactive rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => { setEditingMember(null); setIsModalOpen(true) }}
              className="bg-gradient-to-r from-[#C9A84C] to-[#a8873a] hover:from-[#D4B85E] hover:to-[#C9A84C] text-[#1A2E1A] font-bold shadow-lg btn-interactive rounded-xl px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {csvPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl overflow-hidden"
            >
              <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gradient-gold text-lg font-bold">
                    Preview Import ({csvPreview.length} members)
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCsvPreview(null)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 btn-interactive rounded-xl"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmImport}
                      className="bg-gradient-to-r from-[#C9A84C] to-[#a8873a] text-[#1A2E1A] font-bold btn-interactive rounded-xl"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Import
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-[#C9A84C]/20">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#C9A84C]/20 bg-[#C9A84C]/5">
                        <th className="text-left py-3 px-4 text-[#C9A84C] font-medium uppercase text-xs tracking-wider">Name</th>
                        <th className="text-left py-3 px-4 text-[#C9A84C]/70 font-medium uppercase text-xs tracking-wider">Phone</th>
                        <th className="text-left py-3 px-4 text-[#C9A84C]/70 font-medium uppercase text-xs tracking-wider">Birthday</th>
                        <th className="text-left py-3 px-4 text-[#C9A84C]/70 font-medium uppercase text-xs tracking-wider">Anniversary</th>
                        <th className="text-left py-3 px-4 text-[#C9A84C]/70 font-medium uppercase text-xs tracking-wider">Cell Group</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 5).map((m, i) => (
                        <tr key={i} className="border-b border-[#C9A84C]/10 hover:bg-[#C9A84C]/5 transition-colors">
                          <td className="py-3 px-4 text-white">{m.name}</td>
                          <td className="py-3 px-4 text-white/50">{m.phone || "-"}</td>
                          <td className="py-3 px-4 text-white/50">{m.birthday ? formatDate(m.birthday) : "-"}</td>
                          <td className="py-3 px-4 text-white/50">{m.anniversary ? formatDate(m.anniversary) : "-"}</td>
                          <td className="py-3 px-4 text-white/50">{m.cellGroup || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvPreview.length > 5 && (
                    <p className="text-white/30 text-sm py-3 px-4 bg-[#C9A84C]/5">
                      ... and {csvPreview.length - 5} more members
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 drag-glow ${
            isDragging ? "dragging" : "border-[#C9A84C]/30 hover:border-[#C9A84C]/50"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-4 bg-[#C9A84C]/10 rounded-full blur-xl" />
            <div className="relative p-4 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30">
              <Upload className={`w-8 h-8 text-[#C9A84C] transition-transform duration-300 ${isDragging ? "scale-125" : ""}`} />
            </div>
          </div>
          <p className="text-white/60 mb-2">
            Drag and drop a CSV file here, or{" "}
            <label className="text-[#C9A84C] cursor-pointer hover:underline font-medium">
              browse
              <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
            </label>
          </p>
          <p className="text-white/30 text-sm">
            CSV columns: Name, Phone, Birthday, Anniversary, Baby Dedication, Cell Group
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30">
                <Users className="w-5 h-5 text-[#C9A84C]" />
              </div>
              <h2 className="text-gradient-gold text-xl font-bold">Members</h2>
              <span className="text-white/30 text-sm font-normal">({filteredMembers.length})</span>
            </div>

            {members.length === 0 ? (
              <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-6 bg-[#C9A84C]/10 rounded-full blur-2xl" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#C9A84C]/20 to-transparent border border-[#C9A84C]/30 flex items-center justify-center">
                    <Users className="w-12 h-12 text-[#C9A84C]/40" />
                  </div>
                </div>
                <h3 className="text-white text-xl font-medium mb-2">No members yet</h3>
                <p className="text-white/30 mb-6">Add your first member or import from a CSV file</p>
                <Button
                  onClick={() => { setEditingMember(null); setIsModalOpen(true) }}
                  className="bg-gradient-to-r from-[#C9A84C] to-[#a8873a] text-[#1A2E1A] btn-interactive rounded-xl px-8"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              </motion.div>
            ) : (
              <div className="rounded-xl border border-[#C9A84C]/20 overflow-hidden">

                {/* HEADER ROW */}
                <div className="flex items-center bg-[#C9A84C]/5 border-b border-[#C9A84C]/20">
                  <div style={col.avatar}></div>
                  <div style={col.name} className={`${headerCell} cursor-pointer hover:text-[#D4B85E]`} onClick={() => handleSort("name")}>
                    <span className="flex items-center gap-2">Name <SortIcon field="name" /></span>
                  </div>
                  <div style={col.phone} className={headerCell}>Phone</div>
                  <div style={col.birthday} className={`${headerCell} hidden md:block`}>Birthday</div>
                  <div style={col.anniversary} className={`${headerCell} hidden lg:block`}>Anniversary</div>
                  <div style={col.cellGroup} className={`${headerCell} hidden sm:block cursor-pointer hover:text-[#D4B85E]`} onClick={() => handleSort("cellGroup")}>
                    <span className="flex items-center gap-2">Cell Group <SortIcon field="cellGroup" /></span>
                  </div>
                  <div style={col.actions} className={headerCell}>Actions</div>
                </div>

                {/* DATA ROWS */}
                {filteredMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    className={`flex items-center border-b border-[#C9A84C]/10 hover:bg-[#C9A84C]/5 transition-all duration-200 ${deletingId === member.id ? "animate-shake" : ""}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.03, duration: 0.3 }}
                  >
                    {/* Avatar */}
                    <div style={col.avatar} className="py-3 px-3 flex items-center justify-center">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover border-2 border-[#C9A84C]/30"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A84C]/30 to-[#C9A84C]/10 flex items-center justify-center border-2 border-[#C9A84C]/20">
                          <span className="text-[#C9A84C] text-xs font-bold">{member.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    {/* Name */}
                    <div style={col.name} className="py-4 px-4 text-white font-medium truncate">
                      {member.name}
                    </div>
                    <div style={col.phone} className={dataCell}>{member.phone || "-"}</div>
                    <div style={{ ...col.birthday }} className={`${dataCell} hidden md:block`}>
                      {member.birthday ? formatDate(member.birthday) : "-"}
                    </div>
                    <div style={{ ...col.anniversary }} className={`${dataCell} hidden lg:block`}>
                      {member.anniversary ? formatDate(member.anniversary) : "-"}
                    </div>
                    <div style={col.cellGroup} className={`${dataCell} hidden sm:block`}>{member.cellGroup || "-"}</div>
                    <div style={col.actions} className="py-4 px-4 flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(member)}
                        className="text-[#C9A84C] hover:bg-[#C9A84C]/10 btn-interactive rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
                        className="text-red-400 hover:bg-red-500/10 btn-interactive rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.button
        onClick={() => { setEditingMember(null); setIsModalOpen(true) }}
        className="fab-gold md:hidden"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus className="w-6 h-6 text-[#1A2E1A]" />
      </motion.button>

      <MemberModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingMember(null) }}
        onSave={handleSave}
        member={editingMember}
      />
    </div>
  )
}
