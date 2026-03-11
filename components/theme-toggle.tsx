"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

import { useAuth } from "@/components/providers/auth-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { user, profile } = useAuth()
  const [mounted, setMounted] = React.useState(false)
  const initialized = React.useRef(false)

  // On mount: set mounted flag to render without hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Load saved theme from AuthProvider ONLY once to avoid overriding local manual toggles
  React.useEffect(() => {
    if (profile?.preferred_theme && !initialized.current) {
      if (theme !== profile.preferred_theme) {
        setTheme(profile.preferred_theme)
      }
      initialized.current = true
    }
  }, [profile?.preferred_theme, theme, setTheme])

  if (!mounted) {
    return <div className="w-[72px] h-6"></div> // placeholder for layout shift
  }

  // Determine if the current theme acts as dark
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const handleToggle = async (checked: boolean) => {
    const newTheme = checked ? "dark" : "light"
    setTheme(newTheme)

    // Persist to Supabase if logged in (fire-and-forget)
    try {
      if (user) {
        const supabase = createClient()
        await (supabase.from('profiles') as any)
          .update({ preferred_theme: newTheme })
          .eq('id', user.id)
      }
    } catch {
      // Silently fail — localStorage still works as fallback via next-themes
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-[1.2rem] w-[1.2rem] text-foreground/70" />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label="Toggle theme"
        className="data-[state=checked]:bg-primary"
      />
      <Moon className="h-[1.2rem] w-[1.2rem] text-foreground/70" />
    </div>
  )
}
