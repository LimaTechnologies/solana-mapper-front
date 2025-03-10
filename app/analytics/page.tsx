"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowDownUp, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import prettyMilliseconds from "pretty-ms"
import { useTokens } from "@/contexts/TokenContext"

// Interfaces provided by the user
export interface IStates {
    statebenchmark: string;

    buy_count: number;
    sell_count: number;
    tx_count: number;

    total_sol_volume: number;
    buy_volume: number;
    sell_volume: number;

    real_sol_reserves: number;

    maker_count: number;
    holder_count: number;
    timestamp: number;
    time_before_state: number;

    state: number,
    mint: string
}

export interface ITokensInfo {
    mint: string,
    states: IStates[],
    rating: 1 | 3
}

// Define the type for aggregated data
export type AggregatedData = {
    state: number;
    statebenchmark: string;
    rating: number;
    txCount: number;
    buyCount: number;
    sellCount: number;
    totalSolVolume: number;
    buyVolume: number;
    sellVolume: number;
    txSpeed: number;
    realSolReserves: number;
    makerCount: number;
    avgMakerPerToken: number;
    holderCount: number;
    avgHolderPerToken: number;
    avgTimeBeforeStateChange: number;
    tokenCount: number;
}

// Define the type for anomalies
export type Anomaly = {
    state: number;
    metric: string;
    value: number;
    avg: number;
}

// Function to aggregate data by state
const aggregateByState = (tokens: ITokensInfo[], selectedRating: string): AggregatedData[] => {
    const stateMap = new Map<number, AggregatedData>()

    // Filter tokens by rating if needed
    const filteredTokens = selectedRating === "all"
        ? tokens
        : tokens.filter(token => token.rating === parseInt(selectedRating) as 1 | 3)

    // Process each token and its states
    filteredTokens.forEach(token => {
        token.states.forEach(stateData => {
            const state = stateData.state

            if (!stateMap.has(state)) {
                stateMap.set(state, {
                    state,
                    statebenchmark: stateData.statebenchmark,
                    rating: token.rating,
                    txCount: 0,
                    buyCount: 0,
                    sellCount: 0,
                    totalSolVolume: 0,
                    buyVolume: 0,
                    sellVolume: 0,
                    txSpeed: 0,
                    realSolReserves: 0,
                    makerCount: 0,
                    avgMakerPerToken: 0,
                    holderCount: 0,
                    avgHolderPerToken: 0,
                    avgTimeBeforeStateChange: 0,
                    tokenCount: 0
                })
            }

            const stateAgg = stateMap.get(state)!

            // Accumulate values
            stateAgg.txCount += stateData.tx_count
            stateAgg.buyCount += stateData.buy_count
            stateAgg.sellCount += stateData.sell_count
            stateAgg.totalSolVolume += stateData.total_sol_volume
            stateAgg.buyVolume += stateData.buy_volume
            stateAgg.sellVolume += stateData.sell_volume
            stateAgg.realSolReserves += stateData.real_sol_reserves
            stateAgg.makerCount += stateData.maker_count
            stateAgg.holderCount += stateData.holder_count
            stateAgg.avgTimeBeforeStateChange += stateData.time_before_state
            stateAgg.tokenCount++
        })
    })

    // Calculate averages and derived metrics
    const result = Array.from(stateMap.values()).map(stateAgg => {
        if (stateAgg.tokenCount > 0) {
            stateAgg.realSolReserves /= stateAgg.tokenCount
            stateAgg.avgMakerPerToken = stateAgg.makerCount / stateAgg.tokenCount
            stateAgg.avgHolderPerToken = stateAgg.holderCount / stateAgg.tokenCount
            stateAgg.avgTimeBeforeStateChange /= stateAgg.tokenCount
        }

        // Calculate transaction speed
        stateAgg.txSpeed = stateAgg.totalSolVolume > 0
            ? stateAgg.txCount / stateAgg.totalSolVolume
            : 0

        return stateAgg
    })

    return result
}

// Function to identify anomalies
const findAnomalies = (data: AggregatedData[]): Anomaly[] => {
    if (!data.length) return []

    const anomalies: Anomaly[] = []

    // Calculate averages for key metrics
    const avgTxCount = data.reduce((sum, row) => sum + row.txCount, 0) / data.length
    const avgSolVolume = data.reduce((sum, row) => sum + row.totalSolVolume, 0) / data.length
    const avgTxSpeed = data.reduce((sum, row) => sum + row.txSpeed, 0) / data.length

    // Check for anomalies (values that deviate significantly from the average)
    data.forEach(row => {
        if (row.txCount > avgTxCount * 1.5) {
            anomalies.push({ state: row.state, metric: 'Transaction Count', value: row.txCount, avg: avgTxCount })
        }
        if (row.totalSolVolume > avgSolVolume * 1.5) {
            anomalies.push({ state: row.state, metric: 'SOL Volume', value: row.totalSolVolume, avg: avgSolVolume })
        }
        if (row.txSpeed > avgTxSpeed * 1.5) {
            anomalies.push({ state: row.state, metric: 'Transaction Speed', value: row.txSpeed, avg: avgTxSpeed })
        }
    })

    return anomalies
}

export default function AnalyticsTable() {
    const { getRatedTokens } = useTokens()
    const [selectedRating, setSelectedRating] = useState("all")
    const [sortColumn, setSortColumn] = useState("state")
    const [sortDirection, setSortDirection] = useState("asc")
    const [data, setData] = useState<AggregatedData[]>([])
    const [anomalies, setAnomalies] = useState<Anomaly[]>([])
    const [tokensData, setTokensData] = useState<ITokensInfo[]>([])

    // Fetch data using the hook
    useEffect(() => {
        getRatedTokens()
            .then((data) => {
                setTokensData(data)
            })
    }, [getRatedTokens])

    // Process data when tokens data or filters change
    useEffect(() => {
        if (tokensData.length === 0) return

        // Aggregate data by state
        let aggregatedData = aggregateByState(tokensData, selectedRating)

        // Sort data
        aggregatedData.sort((a, b) => {
            const aValue = a[sortColumn as keyof AggregatedData]
            const bValue = b[sortColumn as keyof AggregatedData]

            if (sortDirection === "asc") {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

        setData(aggregatedData)
        setAnomalies(findAnomalies(aggregatedData))
    }, [tokensData, selectedRating, sortColumn, sortDirection])

    const handleSort = (column: keyof AggregatedData | string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortColumn(column)
            setSortDirection("asc")
        }
    }

    const formatNumber = (num: number, decimals = 0) => {
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle>Token Analytics by State</CardTitle>
                        <CardDescription>
                            Comparing patterns between tokens with different ratings
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Filter by Rating:</span>
                        <Select value={selectedRating} onValueChange={setSelectedRating}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="All Ratings" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Ratings</SelectItem>
                                <SelectItem value="1">Rating 1</SelectItem>
                                <SelectItem value="3">Rating 3</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {anomalies.length > 0 && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                            <h3 className="font-medium">Anomalies Detected</h3>
                        </div>
                        <ul className="text-sm space-y-1">
                            {anomalies.slice(0, 3).map((anomaly, i) => (
                                <li key={i}>
                                    State {anomaly.state}: {anomaly.metric} ({formatNumber(anomaly.value, 2)}) is significantly higher than average ({formatNumber(anomaly.avg, 2)})
                                </li>
                            ))}
                            {anomalies.length > 3 && (
                                <li className="text-muted-foreground">
                                    + {anomalies.length - 3} more anomalies detected
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableCaption>
                            Aggregate analysis by state for tokens with ratings {selectedRating === "all" ? "1 and 3" : selectedRating}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-1 p-0 h-auto font-medium"
                                        onClick={() => handleSort("state")}
                                    >
                                        State
                                        {sortColumn === "state" && (
                                            <ArrowDownUp className="h-3 w-3" />
                                        )}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-1 p-0 h-auto font-medium"
                                            onClick={() => handleSort("rating")}
                                        >
                                            Rating
                                            {sortColumn === "rating" && (
                                                <ArrowDownUp className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-1 p-0 h-auto font-medium"
                                        onClick={() => handleSort("txCount")}
                                    >
                                        Transactions
                                        {sortColumn === "txCount" && (
                                            <ArrowDownUp className="h-3 w-3" />
                                        )}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex items-center gap-1 p-0 h-auto font-medium"
                                                    onClick={() => handleSort("buyCount")}
                                                >
                                                    Buy/Sell
                                                    {sortColumn === "buyCount" && (
                                                        <ArrowDownUp className="h-3 w-3" />
                                                    )}
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Buy and Sell Transaction Counts</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-1 p-0 h-auto font-medium"
                                        onClick={() => handleSort("totalSolVolume")}
                                    >
                                        SOL Volume
                                        {sortColumn === "totalSolVolume" && (
                                            <ArrowDownUp className="h-3 w-3" />
                                        )}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex items-center gap-1 p-0 h-auto font-medium"
                                                    onClick={() => handleSort("txSpeed")}
                                                >
                                                    TX Speed
                                                    {sortColumn === "txSpeed" && (
                                                        <ArrowDownUp className="h-3 w-3" />
                                                    )}
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Transaction Count / Total SOL Volume</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableHead>
                                <TableHead>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex items-center gap-1 p-0 h-auto font-medium"
                                                    onClick={() => handleSort("makerCount")}
                                                >
                                                    Makers
                                                    {sortColumn === "makerCount" && (
                                                        <ArrowDownUp className="h-3 w-3" />
                                                    )}
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Total Maker Count / Avg per Token</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableHead>
                                <TableHead>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex items-center gap-1 p-0 h-auto font-medium"
                                                    onClick={() => handleSort("holderCount")}
                                                >
                                                    Holders
                                                    {sortColumn === "holderCount" && (
                                                        <ArrowDownUp className="h-3 w-3" />
                                                    )}
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Total Holder Count / Avg per Token</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-1 p-0 h-auto font-medium whitespace-nowrap"
                                        onClick={() => handleSort("avgTimeBeforeStateChange")}
                                    >
                                        Avg Time Before Change
                                        {sortColumn === "avgTimeBeforeStateChange" && (
                                            <ArrowDownUp className="h-3 w-3" />
                                        )}
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row, i) => (
                                <TableRow key={i} className={i % 2 === 0 ? "bg-muted/50" : ""}>
                                    <TableCell className="font-medium">{row.state}</TableCell>
                                    <TableCell>
                                        <Badge variant={row.rating === 1 ? "outline" : "default"}>
                                            {row.rating}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatNumber(row.txCount)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-green-600 dark:text-green-500">{formatNumber(row.buyCount)}</span>
                                            <span className="text-red-600 dark:text-red-500">{formatNumber(row.sellCount)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{formatNumber(row.totalSolVolume, 2)}</span>
                                            <div className="flex gap-1 text-xs text-muted-foreground">
                                                <span className="text-green-600 dark:text-green-500">{formatNumber(row.buyVolume, 1)}</span>
                                                <span>/</span>
                                                <span className="text-red-600 dark:text-red-500">{formatNumber(row.sellVolume, 1)}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatNumber(row.txSpeed, 4)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{formatNumber(row.makerCount)}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatNumber(row.avgMakerPerToken, 1)} avg/token
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{formatNumber(row.holderCount)}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatNumber(row.avgHolderPerToken, 1)} avg/token
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{prettyMilliseconds(row.avgTimeBeforeStateChange * 1000, { compact: true })}</TableCell>
                                </TableRow>
                            ))}
                            {data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-24 text-center">
                                        No data available
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}