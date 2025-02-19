"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { useTokens } from "@/contexts/TokenContext"

export default function EvaluatePage() {
    const { evaluateTokens, getTokensToEvaluate } = useTokens()
    const [currentToken, setCurrentToken] = useState<string>()
    const [rating, setRating] = useState(0)

    useEffect(() => {
        fetchTokensToEvaluate()
    }, [])

    const fetchTokensToEvaluate = async () => {
        const tokens: string[] = await getTokensToEvaluate()
        setCurrentToken(tokens[0])
    }

    const handleRating = async (value: number) => {
        setRating(value)

        if (currentToken) {
            await evaluateTokens({
                rating: value,
                token: currentToken,
            })
        }

        const tokens: string[] = await getTokensToEvaluate()

        setCurrentToken(tokens[0])
        setRating(0)
    }

    return (
        <div className="flex justify-center items-center text-white w-[90%] m-auto h-full">
            <div className="shadow-2xl p-12 rounded-lg w-full min-h-[48rem]">
                <h1 className="text-2xl font-bold mb-4 w-full">Rate this token</h1>
                <p className="text-lg mb-8 w-full">{currentToken || "Searching..."}</p>
                <div id="dexscreener-embed" className="pb-10">
                    <iframe
                        src={`https://dexscreener.com/solana/${currentToken}?embed=1&loadChartSettings=0&trades=0&chartLeftToolbar=0&chartTheme=dark&chartDefaultOnMobile=1&theme=dark&chartStyle=0&chartType=usd&interval=5`}
                        className="w-full h-[40rem]"
                    />
                </div>
                <div className="flex justify-center gap-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-8 h-8 cursor-pointer ${star <= rating ? "text-white fill-yellow-400" : "text-yellow-300"
                                }`}
                            onClick={() => handleRating(star)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}