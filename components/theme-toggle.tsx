"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // On mount: load saved theme from Supabase if user is logged in
  React.useEffect(() => {
    setMounted(true)

    const loadSavedTheme = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_theme')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.preferred_theme) {
        setTheme(profile.preferred_theme)
      }
    }

    loadSavedTheme()
  }, [setTheme])

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
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
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
