import type { ITokenData } from "@/types/token"
import Image from "next/image"

export default function TokenList({
    tokens,
    onClick
}: {
    tokens: ITokenData[],
    onClick: (token: string) => void
}) {
    return (
        <div className="overflow-x-auto min-w-[80%]">
            <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-900">
                    <tr>
                        <th className="px-4 py-2 text-center">Overall</th>
                        <th className="px-4 py-2 text-center">Rating</th>
                        <th className="px-4 py-2 text-left">Token</th>
                        <th className="px-4 py-2 text-right">SOL Reserve</th>
                        <th className="px-4 py-2 text-right">Holders</th>
                        <th className="px-4 py-2 text-right">Volume</th>
                        <th className="px-4 py-2 text-right">Trades</th>
                    </tr>
                </thead>
                <tbody>
                    {tokens.map((token, index) => (
                        <tr
                            key={token.mint}
                            className={`border-b border-gray-700 ${index % 2 === 0 ? "bg-gray-700" : "bg-gray-800"}`}
                            onClick={() => onClick(token.mint)}
                        >
                            <td className={`px-4 py-2 ${token.overall == 2 ? "text-yellow-500" : token.overall == 3 ? "text-green-400" : "text-red-500"}`}>
                                {
                                    token.overall
                                }
                            </td>
                            <td className={`px-4 py-2 ${token.rating == 2 ? "text-yellow-500" : token.rating == 3 ? "text-green-400" : "text-red-500"}`}>
                                {
                                    token.rating
                                }
                            </td>

                            <td className="px-4 py-2">
                                <div className="flex items-center">
                                    <Image
                                        src={token.metadata?.image || "/placeholder.svg?height=30&width=30"}
                                        alt={""}
                                        width={30}
                                        height={30}
                                        className="rounded-full mr-2"
                                    />
                                    <div className="flex flex-col items-start">
                                        <p className="font-semibold">{token.name}</p>
                                        <p className="text-sm text-gray-500">{token.symbol}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-2 text-right">{token.sol_reserve.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">{token.holdersCount}</td>
                            <td className="px-4 py-2 text-right">{token.volume.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">{token.tradeCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}