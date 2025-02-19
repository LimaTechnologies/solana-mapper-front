import type { ITokenData } from "@/types/token"
import Image from "next/image"

interface TokenKingProps {
    token?: ITokenData
    position: number
}

export default function TokenKing({ token, position }: TokenKingProps) {
    const podiumHeight = position === 1 ? "h-32" : position === 2 ? "h-24" : "h-14"
    const podiumColor = position === 1 ? "bg-yellow-400" : position === 2 ? "bg-gray-300" : "bg-yellow-700"
    const containerOrder = position === 1 ? "order-2" : position === 2 ? "order-1" : "order-3"

    if (!token) {
        return (
            <div className={`flex flex-col items-center mx-4 ${podiumHeight} ${containerOrder}`}>
                <div className={`w-40 ${podiumHeight} ${podiumColor} rounded-t-lg flex items-end justify-center pb-2`}>
                    <span className="text-5xl font-bold text-white">{position}</span>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`
                flex flex-col items-center mx-4 ${containerOrder} transition-all duration-300 transform hover:scale-105 px-5 shadow-2xl rounded-md w-60 border-b-[0.5px] pt-5
                ${position === 1 ? "border-yellow-500 mb-10" : position === 2 ? "border-gray-300" : "border-yellow-700"}
                `}
        >
            <div className="flex-grow flex flex-col items-center justify-end pb-4">
                <Image
                    src={token.metadata?.image || "/placeholder.svg?height=80&width=80"}
                    alt={token.name || "Token"}
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-white shadow-lg"
                />
                <h2 className="text-2xl font-bold flex-wrap text-center text-white mt-2">{token.name || "Unknown Token"}</h2>
                <p className="text-lg0">{token.symbol || "N/A"}</p>
                <p className="text-4xl font-bold text-yellow-500 mt-2">{token.sol_reserve?.toFixed(2) || "0.00"}</p>
                <p className="text-sm">SOL Reserve</p>
                <div className="mt-2 text-center">
                    <p className="text-sm">Holders: {token.holdersCount || 0}</p>
                    <p className="text-sm">Volume: {token.volume?.toFixed(2) || "0.00"}</p>
                    <p className="text-sm">Trades: {token.tradeCount || 0}</p>
                </div>
            </div>
            <div className={`w-40 ${podiumHeight} ${podiumColor} rounded-t-lg flex justify-center pb-2 items-center`}>
                <span className="text-5xl font-bold text-white">{position}</span>
            </div>
        </div>
    )
}