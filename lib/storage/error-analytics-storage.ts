import { ErrorAnalytics } from '../error-analytics'

interface StorageData {
  analytics: ErrorAnalytics
  trends: any[]
}

export class StorageAdapter {
  private readonly storageKey = 'error_analytics'
  private readonly maxStorageSize = 5 * 1024 * 1024 // 5MB limit

  async getData(): Promise<StorageData | null> {
    try {
      if (typeof window === 'undefined') {
        return null
      }

      const data = localStorage.getItem(this.storageKey)
      if (!data) {
        return null
      }

      return JSON.parse(data, (key, value) => {
        // Revive Sets from arrays
        if (Array.isArray(value) && 
            (key === 'contexts' || 
             key === 'userAgents' || 
             key === 'urls' || 
             key === 'impactedUsers' || 
             key === 'relatedErrors')) {
          return new Set(value)
        }
        return value
      })
    } catch (error) {
      console.error('Failed to read error analytics data:', error)
      return null
    }
  }

  async saveData(data: StorageData): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return
      }

      const serializedData = JSON.stringify(data, (key, value) => {
        // Convert Sets to arrays for serialization
        if (value instanceof Set) {
          return Array.from(value)
        }
        return value
      })

      if (serializedData.length > this.maxStorageSize) {
        throw new Error('Storage size limit exceeded')
      }

      localStorage.setItem(this.storageKey, serializedData)
    } catch (error) {
      console.error('Failed to save error analytics data:', error)
      throw error
    }
  }

  async clearData(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return
      }

      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.error('Failed to clear error analytics data:', error)
      throw error
    }
  }
} 