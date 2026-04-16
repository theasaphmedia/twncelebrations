"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

export interface Member {
  id: string
  name: string
  phone?: string
  birthday?: { day: number; month: number; year?: number }
  anniversary?: { day: number; month: number; year?: number }
  babyDedication?: { day: number; month: number; year?: number }
  cellGroup?: string
  photo?: string
}

interface MembersContextType {
  members: Member[]
  loading: boolean
  addMember: (member: Omit<Member, "id">) => Promise<void>
  updateMember: (id: string, member: Partial<Member>) => Promise<void>
  deleteMember: (id: string) => Promise<void>
  importMembers: (members: Omit<Member, "id">[]) => Promise<number>
}

const MembersContext = createContext<MembersContextType | undefined>(undefined)

// Convert from Supabase row to Member object
const rowToMember = (row: any): Member => ({
  id: row.id,
  name: row.name,
  phone: row.phone || undefined,
  birthday: row.birthday_day ? { day: row.birthday_day, month: row.birthday_month } : undefined,
  anniversary: row.anniversary_day ? { day: row.anniversary_day, month: row.anniversary_month } : undefined,
  babyDedication: row.baby_dedication_day ? { day: row.baby_dedication_day, month: row.baby_dedication_month } : undefined,
  cellGroup: row.cell_group || undefined,
  photo: row.photo || undefined,
})

// Convert from Member object to Supabase row
const memberToRow = (member: Omit<Member, "id">) => ({
  name: member.name,
  phone: member.phone || null,
  birthday_day: member.birthday?.day || null,
  birthday_month: member.birthday?.month || null,
  anniversary_day: member.anniversary?.day || null,
  anniversary_month: member.anniversary?.month || null,
  baby_dedication_day: member.babyDedication?.day || null,
  baby_dedication_month: member.babyDedication?.month || null,
  cell_group: member.cellGroup || null,
  photo: member.photo || null,
})

export function MembersProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  // Load members from Supabase on mount
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("name")

      if (!error && data) {
        setMembers(data.map(rowToMember))
      }
      setLoading(false)
    }

    fetchMembers()
  }, [])

  const addMember = async (member: Omit<Member, "id">) => {
    const { data, error } = await supabase
      .from("members")
      .insert(memberToRow(member))
      .select()
      .single()

    if (!error && data) {
      setMembers((prev) => [...prev, rowToMember(data)])
    }
  }

  const updateMember = async (id: string, updates: Partial<Member>) => {
    const current = members.find((m) => m.id === id)
    if (!current) return

    const merged = { ...current, ...updates }
    const { error } = await supabase
      .from("members")
      .update(memberToRow(merged))
      .eq("id", id)

    if (!error) {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)))
    }
  }

  const deleteMember = async (id: string) => {
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", id)

    if (!error) {
      setMembers((prev) => prev.filter((m) => m.id !== id))
    }
  }

  const importMembers = async (newMembers: Omit<Member, "id">[]): Promise<number> => {
    const existingNames = new Set(members.map((m) => m.name.toLowerCase()))
    const uniqueMembers = newMembers.filter(
      (m) => !existingNames.has(m.name.toLowerCase())
    )

    if (uniqueMembers.length === 0) return 0

    const { data, error } = await supabase
      .from("members")
      .insert(uniqueMembers.map(memberToRow))
      .select()

    if (!error && data) {
      setMembers((prev) => [...prev, ...data.map(rowToMember)])
      return data.length
    }

    return 0
  }

  return (
    <MembersContext.Provider
      value={{ members, loading, addMember, updateMember, deleteMember, importMembers }}
    >
      {children}
    </MembersContext.Provider>
  )
}

export function useMembers() {
  const context = useContext(MembersContext)
  if (context === undefined) {
    throw new Error("useMembers must be used within a MembersProvider")
  }
  return context
}