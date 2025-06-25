"use client"

import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
    state: number
    mint: string
}

export interface APIReturn {
    mint: string
    rating: number
    states: IStates[]
}

export default function TokenAnalyticsTable() {
    const { getRatedTokens } = useTokens() // Assuming this is already implemented
    const [selectedState, setSelectedState] = useState<string>("all")
    const [selectedMetricType, setSelectedMetricType] = useState<string>("all")
    const [tokens, setTokens] = useState<APIReturn[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        getRatedTokens().then((data) => {
            setTokens(data)
            setIsLoading(false)
        })
    }, [])

    // Define the metrics to display
    const basicMetrics = [
        { key: "buy_count", label: "Buy Count" },
        { key: "sell_count", label: "Sell Count" },
        { key: "tx_count", label: "Transaction Count" },
        { key: "total_sol_volume", label: "Total SOL Volume" },
        { key: "buy_volume", label: "Buy Volume" },
        { key: "sell_volume", label: "Sell Volume" },
        { key: "real_sol_reserves", label: "Real SOL Reserves" },
        { key: "maker_count", label: "Maker Count" },
        { key: "holder_count", label: "Holder Count" },
    ]

    const derivedMetrics = [
        {
            key: "transaction_speed",
            label: "Transaction Speed",
            calculate: (state: IStates) => (state.total_sol_volume > 0 ? state.tx_count / state.total_sol_volume : 0),
        },
        {
            key: "average_transaction_size",
            label: "Avg Transaction Size",
            calculate: (state: IStates) => (state.tx_count > 0 ? state.total_sol_volume / state.tx_count : 0),
        },
        {
            key: "buy_sell_ratio_count",
            label: "Buy/Sell Ratio (Count)",
            calculate: (state: IStates) => (state.sell_count > 0 ? state.buy_count / state.sell_count : 0),
        },
        {
            key: "buy_sell_ratio_volume",
            label: "Buy/Sell Ratio (Volume)",
            calculate: (state: IStates) => (state.sell_volume > 0 ? state.buy_volume / state.sell_volume : 0),
        },
        {
            key: "maker_holder_ratio",
            label: "Maker/Holder Ratio",
            calculate: (state: IStates) => (state.holder_count > 0 ? state.maker_count / state.holder_count : 0),
        },
    ]

    const allMetrics = [...basicMetrics, ...derivedMetrics]

    // Helper function to calculate median
    const calculateMedian = (values: number[]): number | null => {
        if (values.length === 0) return null

        const sorted = [...values].sort((a, b) => a - b)
        const middle = Math.floor(sorted.length / 2)

        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2
        } else {
            return sorted[middle]
        }
    }

    // Process the data to calculate averages and medians by state and rating
    const processedData = useMemo(() => {
        // Initialize the result object
        const result: Record<
            number,
            Record<
                string,
                Record<
                    number,
                    {
                        avg: number | null
                        median: number | null
                        values: number[]
                    }
                >
            >
        > = {}

        // Initialize states from 10 to 80 in steps of 10
        for (let state = 10; state <= 80; state += 10) {
            result[state] = {}

            // Initialize metrics for each rating
            allMetrics.forEach((metric) => {
                result[state][metric.key] = {
                    1: { avg: null, median: null, values: [] },
                    3: { avg: null, median: null, values: [] },
                }
            })
        }

        // Process each token
        tokens.forEach((token) => {
            const { rating, states } = token

            // Only process tokens with rating 1 or 3
            if (rating !== 1 && rating !== 3) return

            // Process each state for the token
            states.forEach((stateData) => {
                const { state } = stateData

                // Only process states from 10 to 80 in steps of 10
                if (state < 10 || state > 80 || state % 10 !== 0) return

                // Update basic metrics
                basicMetrics.forEach((metric) => {
                    const value = stateData[metric.key as keyof IStates] as number
                    result[state][metric.key][rating].values.push(value)
                })

                // Update derived metrics
                derivedMetrics.forEach((metric) => {
                    const value = metric.calculate(stateData)
                    result[state][metric.key][rating].values.push(value)
                })
            })
        })

        // Calculate averages and medians
        for (let state = 10; state <= 80; state += 10) {
            allMetrics.forEach((metric) => {
                ;[1, 3].forEach((rating) => {
                    const values = result[state][metric.key][rating].values

                    if (values.length > 0) {
                        // Calculate average
                        const sum = values.reduce((acc, val) => acc + val, 0)
                        result[state][metric.key][rating].avg = sum / values.length

                        // Calculate median
                        result[state][metric.key][rating].median = calculateMedian(values)
                    }
                })
            })
        }

        return result
    }, [tokens])

    // Filter the data based on selected state and metric type
    const filteredData = useMemo(() => {
        const states =
            selectedState === "all" ? Array.from({ length: 8 }, (_, i) => (i + 1) * 10) : [Number.parseInt(selectedState)]

        const metrics =
            selectedMetricType === "all" ? allMetrics : selectedMetricType === "basic" ? basicMetrics : derivedMetrics

        return { states, metrics }
    }, [selectedState, selectedMetricType])

    // Format a value for display
    const formatValue = (value: number | null): string => {
        if (value === null) return "N/A"
        return value.toFixed(2)
    }

    // Get unique states for the select dropdown
    const states = Array.from({ length: 8 }, (_, i) => (i + 1) * 10)

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Token Analytics Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-[400px]" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Token Analytics Comparison</span>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                            Rating 1
                        </Badge>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Rating 3
                        </Badge>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="table" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="table">Table View</TabsTrigger>
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                    </TabsList>

                    <TabsContent value="table" className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="state-select" className="text-sm font-medium">
                                    Filter by State
                                </label>
                                <Select value={selectedState} onValueChange={setSelectedState}>
                                    <SelectTrigger id="state-select" className="w-[180px]">
                                        <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All States</SelectItem>
                                        {states.map((state) => (
                                            <SelectItem key={state} value={state.toString()}>
                                                State {state}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="metric-type-select" className="text-sm font-medium">
                                    Filter by Metric Type
                                </label>
                                <Select value={selectedMetricType} onValueChange={setSelectedMetricType}>
                                    <SelectTrigger id="metric-type-select" className="w-[180px]">
                                        <SelectValue placeholder="Select metric type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Metrics</SelectItem>
                                        <SelectItem value="basic">Basic Metrics</SelectItem>
                                        <SelectItem value="derived">Derived Metrics</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead rowSpan={2}>State</TableHead>
                                        <TableHead colSpan={2}>Metric</TableHead>
                                        <TableHead colSpan={2}>Rating 1</TableHead>
                                        <TableHead colSpan={2}>Rating 3</TableHead>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Avg</TableHead>
                                        <TableHead>Median</TableHead>
                                        <TableHead>Avg</TableHead>
                                        <TableHead>Median</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.states.map((state) =>
                                        filteredData.metrics.map((metric, index) => (
                                            <TableRow key={`${state}-${metric.key}`}>
                                                {index === 0 && <TableCell rowSpan={filteredData.metrics.length}>{state}</TableCell>}
                                                <TableCell>{metric.label}</TableCell>
                                                <TableCell>
                                                    {metric.key.startsWith("buy_") ||
                                                        metric.key.startsWith("sell_") ||
                                                        metric.key.endsWith("_count") ||
                                                        metric.key.endsWith("_volume")
                                                        ? "Basic"
                                                        : "Derived"}
                                                </TableCell>
                                                <TableCell className="bg-green-50/30">
                                                    {formatValue(processedData[state][metric.key][1].avg)}
                                                </TableCell>
                                                <TableCell className="bg-green-50/30">
                                                    {formatValue(processedData[state][metric.key][1].median)}
                                                </TableCell>
                                                <TableCell className="bg-blue-50/30">
                                                    {formatValue(processedData[state][metric.key][3].avg)}
                                                </TableCell>
                                                <TableCell className="bg-blue-50/30">
                                                    {formatValue(processedData[state][metric.key][3].median)}
                                                </TableCell>
                                            </TableRow>
                                        )),
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="summary">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Key Insights</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>Compare metrics between tokens with Rating 1 and Rating 3 across different states</li>
                                        <li>View both average and median values for more robust statistical analysis</li>
                                        <li>Analyze both basic metrics (counts, volumes) and derived metrics (ratios, averages)</li>
                                        <li>Filter by specific state or metric type for detailed analysis</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Metrics Explained</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {derivedMetrics.map((metric) => (
                                            <div key={metric.key} className="border-b pb-2 last:border-0">
                                                <div className="font-medium">{metric.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}