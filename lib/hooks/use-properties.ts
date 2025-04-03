"use client"

import { useEffect, useState } from "react"
import { usePropertyStore } from "@/lib/store"

export function useProperties() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { properties, setProperties } = usePropertyStore()

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/properties")

        if (!response.ok) {
          throw new Error("Failed to fetch properties")
        }

        const data = await response.json()
        setProperties(data.features || [])
      } catch (err) {
        console.error("Error fetching properties:", err)
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [setProperties])

  return { properties, loading, error }
}

