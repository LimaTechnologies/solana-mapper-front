"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
import { useTokens } from "@/contexts/TokenContext"

export interface IStates {
    statebenchmark: string
    buy_count: number
    sell_count: number
    tx_count: number
    total_sol_volume: number
    buy_volume: number
    sell_volume: number
    real_sol_reserves: number
    maker_count: number
    holder_count: number
    timestamp: number
    time_before_state: number
}

export const StatItem = ({
    icon,
    value,
    label,
    diff,
}: { icon: React.ReactNode; value: number; label: string; diff?: number }) => (
    <div className="flex items-center space-x-2">
        <div className="text-muted-foreground">{icon}</div>
        <div>
            <div className="font-medium">{value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
        {diff !== undefined && (
            <div className={`text-xs ${diff > 0 ? "text-green-500" : diff < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                {diff > 0 ? "+" : ""}
                {diff.toLocaleString()}
            </div>
        )}
    </div>
)

export default function ProgressModal({
    mint,
    setIsOpen,
    isOpen
}: {
    mint: string,
    setIsOpen: (isOpen: boolean) => void,
    isOpen: boolean
}) {
    const [stateData, setStateData] = useState<IStates[]>([])
    const { getTokenProgressStates } = useTokens()

    useEffect(() => {
        getTokenProgressStates(mint)
            .then((data) => {
                setStateData(data)
            })

        return () => {
            setStateData([])
        }
    }, [mint])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex flex-row justify-between items-center">
                    <DialogTitle className="text-xl font-semibold">Progress Timeline</DialogTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </DialogHeader>
                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                    <div className="flex p-4 space-x-4">
                        {stateData.length > 0 ? (
                            stateData.map((state, index) => {
                                const prevState = index > 0 ? stateData[index - 1] : null
                                return (
                                    <div key={index} className="flex-none w-[400px]">
                                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                            <div className="p-4 bg-primary text-primary-foreground rounded-t-lg">
                                                <h3 className="font-semibold text-lg">{state.statebenchmark.split("_")[1]}</h3>
                                            </div>
                                            <div className="p-4 grid grid-cols-2 gap-4">
                                                <StatItem
                                                    icon={<ShoppingCart size={16} />}
                                                    value={state.buy_count}
                                                    label="Buy Count"
                                                    diff={prevState ? state.buy_count - prevState.buy_count : undefined}
                                                />
                                                <StatItem
                                                    icon={<TrendingUp size={16} />}
                                                    value={state.sell_count}
                                                    label="Sell Count"
                                                    diff={prevState ? state.sell_count - prevState.sell_count : undefined}
                                                />
                                                <StatItem
                                                    icon={<ArrowRightLeft size={16} />}
                                                    value={state.tx_count}
                                                    label="Tx Count"
                                                    diff={prevState ? state.tx_count - prevState.tx_count : undefined}
                                                />
                                                <StatItem
                                                    icon={<Coins size={16} />}
                                                    value={state.total_sol_volume}
                                                    label="Total SOL Volume"
                                                    diff={prevState ? state.total_sol_volume - prevState.total_sol_volume : undefined}
                                                />
                                                <StatItem
                                                    icon={<DollarSign size={16} />}
                                                    value={state.buy_volume}
                                                    label="Buy Volume"
                                                    diff={prevState ? state.buy_volume - prevState.buy_volume : undefined}
                                                />
                                                <StatItem
                                                    icon={<DollarSign size={16} />}
                                                    value={state.sell_volume}
                                                    label="Sell Volume"
                                                    diff={prevState ? state.sell_volume - prevState.sell_volume : undefined}
                                                />
                                                <StatItem
                                                    icon={<Gauge size={16} />}
                                                    value={state.real_sol_reserves}
                                                    label="Real SOL Reserves"
                                                    diff={prevState ? state.real_sol_reserves - prevState.real_sol_reserves : undefined}
                                                />
                                                <StatItem
                                                    icon={<Briefcase size={16} />}
                                                    value={state.maker_count}
                                                    label="Maker Count"
                                                    diff={prevState ? state.maker_count - prevState.maker_count : undefined}
                                                />
                                                <StatItem
                                                    icon={<Users size={16} />}
                                                    value={state.holder_count}
                                                    label="Holder Count"
                                                    diff={prevState ? state.holder_count - prevState.holder_count : undefined}
                                                />
                                                <div className="col-span-2 flex items-center space-x-2 text-sm">
                                                    <Clock size={16} className="text-muted-foreground" />
                                                    <div>{new Date(state.timestamp * 1000).toLocaleString()}</div>
                                                </div>
                                                <div className="col-span-2 flex items-center space-x-2 text-sm">
                                                    <Activity size={16} className="text-muted-foreground" />
                                                    <div>Time Before State: {state.time_before_state} seconds</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
            </DialogContent>
        </Dialog>
    )
}