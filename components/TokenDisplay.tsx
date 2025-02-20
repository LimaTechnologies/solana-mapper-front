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

    const kings = filteredTokens.sort((a, b) => b.sol_reserve - a.sol_reserve).slice(0, 3)

    const handleApplyFilters = async () => {
        setIsLoading(true)
        setIsLoading(false)
        await fetchTokens()
    }

    return (
        <div className="space-y-8 min-h-screen flex flex-col items-center justify-center">
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
            <div className="flex flex-col items-center space-y-4">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-full flex items-center transition-all duration-300 transform hover:scale-105"
                >
                    {showFilters ? "Hide Filters" : "Change Filters"}
                    {showFilters ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
                </button>
                <div
                    className={`w-full max-w-4xl transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    <FilterBar />
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={handleApplyFilters}
                            disabled={isLoading}
                            className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 ${filtersChanged ? "animate-pulse" : ""
                                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {isLoading ? "Applying..." : "Apply Filters"}
                        </button>
                    </div>
                </div>
            </div>
            <TokenList
                tokens={filteredTokens}
                onClick={(token: string) => {
                    setSelectedToken(token)
                    setIsOpen(true)
                }}
            />
        </div>
    )
}