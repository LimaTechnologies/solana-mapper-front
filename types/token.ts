export interface IMetadata {
    name?: string
    symbol?: string
    description?: string
    image?: string
    showName?: boolean
    createdOn?: string
    twitter?: string
    website?: string
}

export interface ITokenData {
    mint: string
    user: string
    bondingCurve: string
    metadata?: IMetadata
    name: string
    symbol: string
    metadata_uri?: string
    holdersCount: number
    tradeCount: number
    volume: number
    buyCount: number
    sellCount: number
    buyVolume: number
    sellVolume: number
    createdAt: number
    migrated: boolean
    migratedAt?: number
    sol_reserve: number
}