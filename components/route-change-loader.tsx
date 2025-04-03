"use client"

import { Progress } from "@/components/ui/progress"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function RouteChangeLoader() {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)

    window.addEventListener("routeChangeStart", handleStart)
    window.addEventListener("routeChangeComplete", handleComplete)
    window.addEventListener("routeChangeError", handleComplete)

    return () => {
      window.removeEventListener("routeChangeStart", handleStart)
      window.removeEventListener("routeChangeComplete", handleComplete)
      window.removeEventListener("routeChangeError", handleComplete)
    }
  }, [])

  useEffect(() => {
    setLoading(false)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Progress value={100} className="w-full h-1" />
    </div>
  )
}

