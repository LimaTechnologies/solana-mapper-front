"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Star } from "lucide-react"
import { useTokens } from "@/contexts/TokenContext"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { IStates, StatItem } from "@/components/StateModal"
import { StatCard } from "@/components/statCard"
// @ts-ignore
import * as compare from "are-objects-equals"

export default function EvaluatePage() {
    const { getProgressToEvaluate, evaluteProgress } = useTokens()
    const [currentToken, setCurrentToken] = useState<string>()
    const [stateData, setStateData] = useState<IStates[]>([])
    const [rating, setRating] = useState(0)
    const [loading, setLoading] = useState(true)
    const [aiRating, setAiRating] = useState(0)

    useEffect(() => {
        fetchTokensToEvaluate()
    }, [])

    const fetchTokensToEvaluate = async () => {
        setLoading(true)
        const {
            mint,
            progress,
            rating_overall
        } = await getProgressToEvaluate()

        setCurrentToken(mint)
        setStateData(progress)
        setAiRating(rating_overall)
        setLoading(false)
        setRating(0)
    }

    const handleRating = async (value: number) => {
        setRating(value)

        if (currentToken) {
            await evaluteProgress({
                rating: value,
                mint: currentToken,
            })
        }

        await fetchTokensToEvaluate()
    }

    return (
        <div className={`flex justify-center items-center text-white w-[90%] m-auto h-full ${loading ? "blur-sm" : ""}`}>
            <div className="shadow-2xl p-12 rounded-lg w-full min-h-[48rem]">
                <p className="text-lg mb-8 w-full">
                    Token training based on progress, evaluate the token based on the progress it has made checking the behaivor by each state reached, search for scam patters like fake holders volume or botted transactions.
                </p>
                <div id="dexscreener-embed" className="pb-10 flex items-center justify-center">
                    <iframe
                        src={`https://dexscreener.com/solana/${currentToken}?embed=1&loadChartSettings=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15&trades=0&tabs=0`}
                        className="w-[70%] h-[40rem]"
                    />
                </div>
                <div className="flex items-start flex-col w-fit mx-auto pb-2">
                    <p className="text-lg text-center w-full pb-4 text-red-500">
                        DO NOT, vote 1 star if the token died, Only vote 1 star if the token is a scam/botted
                    </p>
                </div>

                <div className="flex justify-center gap-8">
                    {[1, 2, 3].map((star) => (
                        <Star
                            key={star}
                            className={`w-8 h-8 cursor-pointer ${star <= rating ? "text-white fill-yellow-400" : "text-yellow-300"
                                }`}
                            onClick={() => handleRating(star)}
                        />
                    ))}
                </div>
                <div className="flex items-center justify-center text-lg py-4">
                    AI Rating: {aiRating}
                </div>
                <ScrollArea className="w-full">
                    <div className="flex p-4 space-x-4">
                        {stateData.length > 0 ? (
                            stateData.map((state, index) => {
                                return (
                                    <StatCard
                                        key={index}
                                        data={state}
                                        warning={
                                            state.tx_count == stateData[index - 1]?.tx_count || state.tx_count == stateData[index + 1]?.tx_count
                                        }
                                    />
                                )
                            })
                        ) : (
                            <div className="flex items-center justify-center w-full h-32 text-muted-foreground">
                                No states reached until now
                            </div>
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </div>
    )
}