"use client"

import { TokenProvider } from "@/contexts/TokenContext"
import { FilterProvider } from "@/contexts/FilterContext"
import TokenDisplay from "@/components/TokenDisplay"

export default function Home() {
  return (
    <FilterProvider>
      <TokenProvider>
        <div className="container mx-auto px-4 py-8">
          <div className="w-full text-center pb-24">
            <h1 className="text-4xl font-bold">{"[ TOKEN KINGS AI ]"}</h1>
          </div>
          <TokenDisplay />
        </div>
      </TokenProvider>
    </FilterProvider>
  )
}