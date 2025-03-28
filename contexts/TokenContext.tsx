"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import type { ITokenData } from "@/types/token"
import { useFilters, type Filters } from "./FilterContext"
import axios from "axios"
import { IStates } from "@/components/StateModal"
interface TokenContextType {
    tokens: ITokenData[]
    filteredTokens: ITokenData[]
    fetchTokens: () => Promise<void>
    getTokensToEvaluate: () => Promise<string[]>
    evaluateTokens: (data: { token: string; rating: number }) => Promise<void>
    getTokenProgressStates: (mint: string) => Promise<any>
    getProgressToEvaluate: () => Promise<{
        mint: string,
        progress: IStates[],
        rating_overall: number
    }>
    evaluteProgress: (data: { mint: string, rating: number }) => Promise<void>
    getProgressToRevaluate: () => Promise<{
        mint: string,
        progress: IStates[],
        rating_overall: number
    }>
    revaluteProgress: (data: { mint: string, rating: number }) => Promise<void>
    getRatedTokens: () => Promise<any[]>
}

const axiosInstance = await axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
})

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
            const { data } = await axiosInstance.get("/tokens")

            setTokens(data)
            setFilteredTokens(data)

            if (!timeout) {
                const newTimeout = setTimeout(() => {
                    fetchTokens()
                }, 1000)
                saveTimeout(newTimeout)
            }
        } catch (error) {
            console.error("Error fetching tokens:", error)
        }
    }

    const getTokenProgressStates = async (mint: string) => {
        const { data } = await axiosInstance.get(`/tokens/state?mint=${mint}`)

        return data
    }

    const getTokensToEvaluate = async () => {
        const { data } = await axiosInstance.get("/tokens/eval/token")

        return data
    }

    const getRatedTokens = async () => {
        const { data } = await axiosInstance.get("/tokens/analytics")

        return data
    }

    const evaluateTokens = async ({ token, rating }: {
        token: string
        rating: number
    }) => {
        try {
            await axiosInstance.post("/tokens/eval/token", {
                token,
                rating,
            })
        } catch (error) {
            console.error("Error evaluating tokens:", error)
        }
    }

    const getProgressToEvaluate = async () => {
        const { data } = await axiosInstance.get("/tokens/eval/state")

        return data
    }

    const getProgressToRevaluate = async () => {
        const { data } = await axiosInstance.get("/tokens/reval/state")

        return data
    }

    const revaluteProgress = async ({ mint, rating }: {
        mint: string
        rating: number
    }) => {
        try {
            await axiosInstance.post("/tokens/reval/state", {
                mint,
                rating,
            })
        } catch (error) {
            console.error("Error evaluating tokens:", error)
        }
    }

    const evaluteProgress = async ({ mint, rating }: {
        mint: string
        rating: number
    }) => {
        try {
            await axiosInstance.post("/tokens/eval/state", {
                mint,
                rating,
            })
        } catch (error) {
            console.error("Error evaluating tokens:", error)
        }
    }

    return <TokenContext.Provider value={{
        tokens, filteredTokens,
        fetchTokens, getTokensToEvaluate, evaluateTokens, getTokenProgressStates, getProgressToEvaluate, evaluteProgress,
        getProgressToRevaluate, revaluteProgress, getRatedTokens
    }}>{children}</TokenContext.Provider>
}