"use client"

import { useState, useEffect } from "react"
import { useTokens } from "@/contexts/TokenContext"
import { useFilters } from "@/contexts/FilterContext"
import TokenKing from "./TokenKing"
import TokenList from "./TokenList"
import FilterBar from "./FilterBar"
import { ChevronDown, ChevronUp } from "lucide-react"
import ProgressModal from "./StateModal"

export default function TokenDisplay() {
    const { filteredTokens, fetchTokens } = useTokens()
    const { showFilters, setShowFilters, filtersChanged, filters } = useFilters()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedToken, setSelectedToken] = useState<string>("")
    const [isOpen, setIsOpen] = useState(false)

    const kings = [...filteredTokens]
        .sort((a, b) => {
            const aScore = Math.floor((a.sol_reserve / a.holdersCount) - (a.holdersCount * a.volume / 75))
            const bScore = Math.floor((b.sol_reserve / b.holdersCount) - (b.holdersCount * b.volume / 75))
            return aScore - bScore // ascending: lowest value first
        })
        .slice(0, 3)

    filteredTokens.sort((a, b) => {
        return b.sol_reserve - a.sol_reserve
    })

    const handleApplyFilters = async () => {
        setIsLoading(true)
        setIsLoading(false)
        await fetchTokens()
    }

    return (
        <div className="space-y-8 min-h-screen flex flex-col items-center justify-center w-full">
            <ProgressModal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                mint={selectedToken}
                key={selectedToken}
            />
            <div className="flex justify-center items-end space-x-4 w-full">
                <TokenKing token={kings[1]} position={2} />
                <TokenKing token={kings[0]} position={1} />
                <TokenKing token={kings[2]} position={3} />
            </div>
            <TokenList
                tokens={filteredTokens}
                onClick={(token: string) => {
                    window.open("https://neo.bullx.io/terminal?chainId=1399811149&address=" + token, "_blank")
                }}
            />
        </div>
    )
}