"use client"

import { TokenProvider } from "@/contexts/TokenContext"
import { FilterProvider } from "@/contexts/FilterContext"
import TokenDisplay from "@/components/TokenDisplay"

export default function Home() {
  return (
    <TokenDisplay />
  )
}