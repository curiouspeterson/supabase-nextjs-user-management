import { ErrorMetrics, ErrorTrend } from '@/lib/error-analytics'

export interface ErrorAnalyticsData {
  version: number
  lastUpdated: string
  metrics: Record<string, ErrorMetrics>
  trends: ErrorTrend[]
}

export interface StorageAdapter {
  initialize(): Promise<void>
  getData(): Promise<ErrorAnalyticsData>
  saveData(data: ErrorAnalyticsData): Promise<void>
  clear(): Promise<void>
}

export class LocalStorageAdapter implements StorageAdapter {
  private readonly storageKey = 'error-analytics'
  private readonly currentVersion = 1
  private readonly maxChunkSize = 5242880 // 5MB
  
  async initialize(): Promise<void> {
    try {
      const data = await this.getData()
      if (data.version < this.currentVersion) {
        await this.migrateData(data)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to initialize storage:', error.message)
      }
      // Initialize with empty data if not exists
      await this.saveData({
        version: this.currentVersion,
        lastUpdated: new Date().toISOString(),
        metrics: {},
        trends: []
      })
    }
  }

  async getData(): Promise<ErrorAnalyticsData> {
    try {
      const serializedData = localStorage.getItem(this.storageKey)
      if (!serializedData) {
        throw new Error('No data found')
      }
      
      // Handle chunked data
      if (serializedData.startsWith('chunk:')) {
        return this.getChunkedData()
      }
      
      return JSON.parse(serializedData)
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to get error analytics data: ${error.message}`)
      }
      throw new Error('Failed to get error analytics data: Unknown error')
    }
  }

  async saveData(data: ErrorAnalyticsData): Promise<void> {
    try {
      data.lastUpdated = new Date().toISOString()
      const serializedData = JSON.stringify(data)
      
      if (serializedData.length > this.maxChunkSize) {
        await this.saveChunkedData(serializedData)
      } else {
        localStorage.setItem(this.storageKey, serializedData)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError') {
          // If quota exceeded, try to free up space by removing old data
          await this.rotateStorage()
          await this.saveData(data)
        } else {
          throw new Error(`Failed to save error analytics data: ${error.message}`)
        }
      } else {
        throw new Error('Failed to save error analytics data: Unknown error')
      }
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear main data and any chunks
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key === this.storageKey || key.startsWith(`${this.storageKey}:chunk:`)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to clear error analytics data: ${error.message}`)
      }
      throw new Error('Failed to clear error analytics data: Unknown error')
    }
  }

  private async getChunkedData(): Promise<ErrorAnalyticsData> {
    const chunkKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(`${this.storageKey}:chunk:`))
      .sort()
    
    let completeData = ''
    chunkKeys.forEach(key => {
      completeData += localStorage.getItem(key)
    })
    
    return JSON.parse(completeData)
  }

  private async saveChunkedData(serializedData: string): Promise<void> {
    // Clear existing chunks
    await this.clear()
    
    // Split data into chunks
    const chunkSize = this.maxChunkSize - 100 // Leave room for chunk metadata
    const chunks = serializedData.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || []
    
    chunks.forEach((chunk, index) => {
      localStorage.setItem(
        `${this.storageKey}:chunk:${index.toString().padStart(5, '0')}`,
        chunk
      )
    })
    
    // Save chunk indicator
    localStorage.setItem(this.storageKey, `chunk:${chunks.length}`)
  }

  private async rotateStorage(): Promise<void> {
    const data = await this.getData()
    
    // Remove old trends
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    data.trends = data.trends.filter(trend => 
      new Date(trend.period) >= oneMonthAgo
    )
    
    // Remove old metrics
    Object.entries(data.metrics).forEach(([key, metrics]) => {
      if (new Date(metrics.lastSeen) < oneMonthAgo) {
        delete data.metrics[key]
      }
    })
    
    await this.saveData(data)
  }

  private async migrateData(data: ErrorAnalyticsData): Promise<void> {
    // Handle data migrations based on version
    switch (data.version) {
      case 1:
        // No migrations yet
        break
      default:
        throw new Error(`Unknown data version: ${data.version}`)
    }
    
    data.version = this.currentVersion
    await this.saveData(data)
  }
} 