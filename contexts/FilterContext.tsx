"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"

export interface Filters {
    minDate?: number
    maxDate?: number
    migrated?: "all" | "true" | "false"
    minHolders?: number
    maxHolders?: number
    minTrades?: number
    maxTrades?: number
    minVolume?: number
    maxVolume?: number
    minSolReserve?: number
    maxSolReserve?: number
}

interface FilterContextType {
    filters: Filters
    setFilters: React.Dispatch<React.SetStateAction<Filters>>
    appliedFilters: Filters
    showFilters: boolean
    setShowFilters: React.Dispatch<React.SetStateAction<boolean>>
    filtersChanged: boolean
}

const defaultFilters: Filters = {
    migrated: "false",
    minVolume: 20,
    minSolReserve: 10,
    minDate: 30 * 60 * 1000,
    minHolders: 25,
    minTrades: 25,
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export const useFilters = () => {
    const context = useContext(FilterContext)
    if (!context) {
        throw new Error("useFilters must be used within a FilterProvider")
    }
    return context
}

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [filters, setFilters] = useState<Filters>(defaultFilters)
    const [appliedFilters, setAppliedFilters] = useState<Filters>(defaultFilters)
    const [showFilters, setShowFilters] = useState(false)
    const [filtersChanged, setFiltersChanged] = useState(false)

    useEffect(() => {
        setFiltersChanged(JSON.stringify(filters) !== JSON.stringify(appliedFilters))
    }, [filters, appliedFilters])

    return (
        <FilterContext.Provider
            value={{
                filters,
                setFilters,
                appliedFilters,
                showFilters,
                setShowFilters,
                filtersChanged,
            }}
        >
            {children}
        </FilterContext.Provider>
    )
}