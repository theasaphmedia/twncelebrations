"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { MembersProvider } from "@/contexts/members-context"
import { TWNApp } from "@/components/twn-app"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <AuthProvider>
      <MembersProvider>
        <TWNApp />
        <Toaster />
      </MembersProvider>
    </AuthProvider>
  )
}
