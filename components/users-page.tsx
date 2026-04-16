"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Users, Eye, EyeOff, Shield, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AppUser {
  id: string
  username: string
  password: string
  role: string
  created_at: string
}

export function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("volunteer")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .order("created_at")

    if (!error && data) setUsers(data)
    setLoading(false)
  }

  const addUser = async () => {
    if (!username || !password) {
      toast({ title: "Error", description: "Username and password are required.", variant: "destructive" })
      return
    }

    const { data, error } = await supabase
      .from("app_users")
      .insert({ username, password, role })
      .select()
      .single()

    if (error) {
      toast({ title: "Error", description: "Username already exists or could not be created.", variant: "destructive" })
      return
    }

    setUsers((prev) => [...prev, data])
    setUsername("")
    setPassword("")
    setRole("volunteer")
    setIsAdding(false)
    toast({ title: "User created", description: `${username} has been added successfully.` })
  }

  const deleteUser = async (id: string, name: string) => {
    if (name === "admin") {
      toast({ title: "Cannot delete admin", description: "The admin user cannot be deleted.", variant: "destructive" })
      return
    }

    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    const { error } = await supabase.from("app_users").delete().eq("id", id)

    if (!error) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast({ title: "User deleted", description: `${name} has been removed.` })
    }
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

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

      <div className="max-w-3xl mx-auto space-y-6 relative">

        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30">
              <Shield className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <h2 className="text-gradient-gold text-xl font-bold">User Management</h2>
          </div>
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-[#C9A84C] to-[#a8873a] hover:from-[#D4B85E] hover:to-[#C9A84C] text-[#1A2E1A] font-bold btn-interactive rounded-xl px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </motion.div>

        {/* Add User Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl overflow-hidden"
            >
              <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
              <div className="p-6 space-y-4">
                <h3 className="text-gradient-gold font-bold text-lg">New User</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="label-gold block">Username</label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-dark w-full h-11 rounded-xl text-white px-4"
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-gold block">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-dark w-full h-11 rounded-xl text-white px-4 pr-12"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A84C]/60 hover:text-[#C9A84C]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-gold block">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input-dark w-full h-11 rounded-xl text-white px-4 appearance-none cursor-pointer"
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => { setIsAdding(false); setUsername(""); setPassword("") }}
                    className="flex-1 border-[#C9A84C]/30 text-white hover:bg-[#C9A84C]/10 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addUser}
                    className="flex-1 bg-gradient-to-r from-[#C9A84C] to-[#a8873a] text-[#1A2E1A] font-bold rounded-xl btn-interactive"
                  >
                    Create User
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users List */}
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
              <h2 className="text-gradient-gold text-xl font-bold">App Users</h2>
              <span className="text-white/30 text-sm">({users.length})</span>
            </div>

            {loading ? (
              <div className="text-center py-8 text-white/40">Loading users...</div>
            ) : (
              <div className="space-y-3">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-[#C9A84C]/20 hover:bg-[#C9A84C]/5 transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A84C]/30 to-[#C9A84C]/10 flex items-center justify-center border-2 border-[#C9A84C]/20">
                        {user.role === "admin" ? (
                          <Shield className="w-4 h-4 text-[#C9A84C]" />
                        ) : (
                          <User className="w-4 h-4 text-[#C9A84C]" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-white/30 text-xs font-mono">
                            {showPasswords[user.id] ? user.password : "••••••••"}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="text-[#C9A84C]/40 hover:text-[#C9A84C] transition-colors"
                          >
                            {showPasswords[user.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30"
                          : "bg-white/5 text-white/50 border border-white/10"
                      }`}>
                        {user.role}
                      </span>
                      {user.username !== "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(user.id, user.username)}
                          className="text-red-400 hover:bg-red-500/10 btn-interactive rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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