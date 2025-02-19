"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import type { ITokenData } from "@/types/token"
import { useFilters, type Filters } from "./FilterContext"

interface TokenContextType {
    tokens: ITokenData[]
    filteredTokens: ITokenData[]
    fetchTokens: () => Promise<void>
}

const TokenContext = createContext<TokenContextType | undefined>(undefined)

export const useTokens = () => {
    const context = useContext(TokenContext)
    if (!context) {
        throw new Error("useTokens must be used within a TokenProvider")
    }
    return context
}

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tokens, setTokens] = useState<ITokenData[]>([])
    const [filteredTokens, setFilteredTokens] = useState<ITokenData[]>([])
    const { filters: CurrentFilters } = useFilters()
    const [timeout, saveTimeout] = useState<NodeJS.Timeout | null>(null)

    useEffect(() => {
        fetchTokens()
    }, [])

    const fetchTokens = async () => {
        try {
            const queryParams = new URLSearchParams()
            Object.entries(CurrentFilters).forEach(([key, value]) => {
                if (value !== undefined && value !== "") {
                    queryParams.append(key, value.toString())
                }
            })

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tokens${queryParams.toString() ? `?${queryParams.toString()}` : ""}`)
            if (!response.ok) {
                throw new Error("Failed to fetch tokens")
            }
            const data = await response.json()

            setTokens(data)
            setFilteredTokens(data)
        } catch (error) {
            console.error("Error fetching tokens:", error)
        }

        const newTimeout = setTimeout(() => {
            fetchTokens()
        })

        if (timeout) {
            clearTimeout(timeout)
            saveTimeout(newTimeout)
        }
    }

    return <TokenContext.Provider value={{ tokens, filteredTokens, fetchTokens }}>{children}</TokenContext.Provider>
}