import { useFilters, type Filters } from "@/contexts/FilterContext"

const timeRanges = [
    { label: "All", value: "" },
    { label: "Last 10 minutes", value: 10 * 60 * 1000 },
    { label: "Last 30 minutes", value: 30 * 60 * 1000 },
    { label: "Last hour", value: 60 * 60 * 1000 },
    { label: "Last 3 hours", value: 3 * 60 * 60 * 1000 },
    { label: "Last 6 hours", value: 6 * 60 * 60 * 1000 },
    { label: "Last 12 hours", value: 12 * 60 * 60 * 1000 },
    { label: "Last 24 hours", value: 24 * 60 * 60 * 1000 },
]

const filterFields: Array<{
    id: keyof Filters
    label: string
    type: "select" | "number"
    options?: Array<{ label: string; value: string | number }>
}> = [
        { id: "minDate", label: "Time Range", type: "select", options: timeRanges },
        { id: "minHolders", label: "Min Holders", type: "number" },
        { id: "maxHolders", label: "Max Holders", type: "number" },
        { id: "minTrades", label: "Min Trades", type: "number" },
        { id: "maxTrades", label: "Max Trades", type: "number" },
        { id: "minVolume", label: "Min Volume", type: "number" },
        { id: "maxVolume", label: "Max Volume", type: "number" },
        { id: "minSolReserve", label: "Min SOL Reserve", type: "number" },
        { id: "maxSolReserve", label: "Max SOL Reserve", type: "number" },
        {
            id: "migrated",
            label: "Migrated",
            type: "select",
            options: [
                { label: "All", value: "all" },
                { label: "Yes", value: "true" },
                { label: "No", value: "false" },
            ],
        },
    ]

export default function FilterBar() {
    const { filters, setFilters } = useFilters()

    const handleChange = (id: keyof Filters, value: string | number) => {
        setFilters((prev) => {
            if (value === "" || value === "all") {
                const newFilters = { ...prev }
                delete newFilters[id]
                return newFilters
            }
            return {
                ...prev,
                [id]: id === "migrated" ? value : Number(value),
            }
        })
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filterFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                        <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                            {field.label}
                        </label>
                        {field.type === "select" ? (
                            <select
                                id={field.id}
                                value={filters[field.id] || ""}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="w-full p-2 border rounded-md bg-white text-gray-900"
                            >
                                {field.options!.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type}
                                id={field.id}
                                value={filters[field.id] || ""}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="w-full p-2 border rounded-md bg-white text-gray-900"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}