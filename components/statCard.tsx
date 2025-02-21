import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, BarChart3, Clock, CoinsIcon as CoinIcon, Users } from "lucide-react"
import prettyMilliseconds from "pretty-ms"
import millify from "millify"
import { IStates } from "./StateModal"

export function StatCard({
    data
}: {
    data: IStates
}) {
    const formatNumber = (num: number) =>
        millify(num, {
            precision: 2,
            lowercase: true,
        })

    return (
        <Card className="w-full max-w-md font-mono bg-transparent text-white font-bold border-0 shadow-2xl p">
            <CardHeader className="text-center w-max mx-auto">
                <CardTitle className="text-lg font-semibold">LP {data.statebenchmark.split("_")[1]} MARK</CardTitle>
            </CardHeader>
            <CardContent className="min-w-max">
                <div className="space-y-1">
                    <div>
                        <h3 className="text-sm font-medium text-gray-50 mb-2">Transactions</h3>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-gray-50" />
                                    {formatNumber(data.tx_count)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-sm flex items-center">
                                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                                    {formatNumber(data.buy_count)}
                                </span>
                                |
                                <span className="text-sm flex items-center">
                                    {formatNumber(data.sell_count)}
                                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <h3 className="text-sm font-medium text-gray-50 mb-2">Volume (SOL)</h3>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm flex items-center gap-2">
                                    <CoinIcon className="h-4 w-4 text-yellow-500" />
                                    {formatNumber(data.total_sol_volume)}
                                </span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <span className="text-sm flex items-center">
                                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                                    {formatNumber(data.buy_volume)}
                                </span>
                                |
                                <span className="text-sm flex items-center">
                                    {formatNumber(data.sell_volume)}
                                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <h3 className="text-sm font-medium text-gray-50 mb-2">Holder Stats</h3>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-sm flex items-center gap-2">
                                    <Users className="h-4 w-4 text-indigo-500" />
                                    {formatNumber(data.holder_count)}
                                </span>
                                <span className="text-sm flex items-center gap-2">
                                    /
                                    {formatNumber(data.maker_count)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <h3 className="text-sm font-medium text-gray-50 mb-2">Time after launch</h3>
                        <div className="flex justify-center items-center">
                            <span className="text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                {prettyMilliseconds(data.time_before_state * 1000)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}