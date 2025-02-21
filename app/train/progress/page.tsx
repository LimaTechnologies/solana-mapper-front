"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { useTokens } from "@/contexts/TokenContext"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
    X,
    ShoppingCart,
    TrendingUp,
    ArrowRightLeft,
    Coins,
    Users,
    Clock,
    Activity,
    DollarSign,
    Gauge,
    Briefcase,
} from "lucide-react"
import { IStates, StatItem } from "@/components/StateModal"
import { StatCard } from "@/components/statCard"

export default function EvaluatePage() {
    const { getProgressToEvaluate, evaluteProgress } = useTokens()
    const [currentToken, setCurrentToken] = useState<string>()
    const [stateData, setStateData] = useState<IStates[]>([])
    const [rating, setRating] = useState(0)

    useEffect(() => {
        fetchTokensToEvaluate()
    }, [])

    const fetchTokensToEvaluate = async () => {
        const {
            mint,
            progress
        } = await getProgressToEvaluate()

        setCurrentToken(mint)
        setStateData(progress)
    }

    const handleRating = async (value: number) => {
        setRating(value)

        if (currentToken) {
            await evaluteProgress({
                rating: value,
                mint: currentToken,
            })
        }

        const { mint, progress } = await getProgressToEvaluate()

        setCurrentToken(mint)
        setStateData(progress)
        setRating(0)
    }

    return (
        <div className="flex justify-center items-center text-white w-[90%] m-auto h-full">
            <div className="shadow-2xl p-12 rounded-lg w-full min-h-[48rem]">
                <p className="text-lg mb-8 w-full">
                    Token training based on progress, evaluate the token based on the progress it has made checking the behaivor by each state reached, search for scam patters like fake holders volume or botted transactions.
                </p>
                <div id="dexscreener-embed" className="pb-10 flex items-center justify-center">
                    <iframe
                        src={`https://dexscreener.com/solana/${currentToken}?embed=1&loadChartSettings=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=5&trades=0&tabs=0`}
                        className="w-[70%] h-[40rem]"
                    />
                </div>
                <p className="text-lg mb-8 w-full">
                    This is the chart, DO NOT, vote 1 star if the token died, vote 1 star if the token is a scam, vote 1 star if the token is a rugpull, vote 1 star if the token is a honeypot
                </p>
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
                <ScrollArea className="w-full">
                    <div className="flex p-4 space-x-4">
                        {stateData.length > 0 ? (
                            stateData.map((state, index) => {
                                const prevState = index > 0 ? stateData[index - 1] : null
                                return (
                                    <StatCard
                                        key={index}
                                        data={state}
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