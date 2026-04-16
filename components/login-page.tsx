"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const success = await login(username, password)

    if (success) {
      onLogin()
    } else {
      setError("Invalid credentials. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060e06] flex items-center justify-center p-4 relative overflow-hidden">

      <div
        className="absolute top-[15%] right-[20%] w-[500px] h-[500px] rounded-full animate-float-orb pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute bottom-[10%] left-[15%] w-[600px] h-[600px] rounded-full animate-float-orb-reverse pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(26,46,26,0.3) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="relative mb-8">
            <div className="absolute -inset-8 rounded-full bg-[#C9A84C]/10 blur-2xl animate-heartbeat" />
            <div className="relative p-6 rounded-full border-2 border-[#C9A84C]/40 animate-glow-soft">
              <div className="absolute inset-0 rounded-full border-2 border-[#C9A84C]/30 animate-pulse-ring" />
              <Image
                src="/images/twn-logo.png"
                alt="The Worship Nation"
                width={200}
                height={56}
                className="relative"
                priority
              />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gradient-gold tracking-tight text-center mb-2">
            Celebrations Hub
          </h1>
          <p className="text-[#C9A84C]/60 text-xs tracking-[0.3em] uppercase">
            The Worship Nation
          </p>
        </motion.div>

        <motion.div
          className="glass rounded-2xl p-8 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-50" />

          <form onSubmit={handleSubmit} className="space-y-6 relative">

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <label htmlFor="username" className="label-gold block">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-dark w-full h-12 rounded-xl text-white placeholder:text-white/30 px-4 bg-black/30"
                placeholder="Enter username"
                required
                disabled={isLoading}
              />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <label htmlFor="password" className="label-gold block">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark w-full h-12 rounded-xl text-white placeholder:text-white/30 px-4 bg-black/30"
                placeholder="Enter password"
                required
                disabled={isLoading}
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="text-red-400 text-sm text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#C9A84C] to-[#a8873a] hover:from-[#D4B85E] hover:to-[#C9A84C] text-[#1A2E1A] font-bold h-12 rounded-xl btn-interactive"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="gold-line w-20 mx-auto mb-4" />
          <p className="text-white/20 text-xs tracking-[0.2em] uppercase">
            Member Celebration Management
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}