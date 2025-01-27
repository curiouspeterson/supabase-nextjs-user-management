'use client'

import { createClient } from '@/utils/supabase/client'
import { AppError, ErrorHandler } from '@/lib/errors'
import { ErrorSeverity, ErrorCategory } from '@/lib/types/error'

export class StorageError extends AppError {
  constructor(
    message: string,
    code: string = 'STORAGE_ERROR',
    public details?: Record<string, unknown>
  ) {
    super(
      message,
      code,
      500,
      true,
      ErrorSeverity.HIGH,
      ErrorCategory.STORAGE,
      details
    )
  }
}

export class StorageQuotaError extends StorageError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'STORAGE_QUOTA_EXCEEDED', details)
  }
}

interface StorageQuotaStatus {
  currentSizeBytes: number
  maxSizeBytes: number
  usagePercentage: number
  needsCleanup: boolean
  lastCleanup: Date | null
}

interface StorageMetrics {
  component: string
  key: string
  sizeBytes: number
  lastAccessed: Date | null
}

export class ErrorAnalyticsStorage {
  private supabase = createClient()
  private errorHandler = ErrorHandler.getInstance()
  private component: string
  private compressionThreshold = 1024 // 1KB

  constructor(component: string) {
    this.component = component
  }

  private async checkQuota(): Promise<StorageQuotaStatus> {
    try {
      const { data, error } = await this.supabase
        .rpc('check_storage_quota_status', {
          p_component: this.component
        })

      if (error) throw error

      return {
        currentSizeBytes: data.current_size_bytes,
        maxSizeBytes: data.max_size_bytes,
        usagePercentage: data.usage_percentage,
        needsCleanup: data.needs_cleanup,
        lastCleanup: data.last_cleanup ? new Date(data.last_cleanup) : null
      }
    } catch (error) {
      throw new StorageError(
        'Failed to check storage quota',
        'QUOTA_CHECK_FAILED',
        { component: this.component, error }
      )
    }
  }

  private async cleanup(olderThanDays: number = 30): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .rpc('cleanup_error_analytics_storage', {
          p_component: this.component,
          p_older_than_days: olderThanDays
        })

      if (error) throw error

      return data
    } catch (error) {
      throw new StorageError(
        'Failed to cleanup storage',
        'CLEANUP_FAILED',
        { component: this.component, olderThanDays, error }
      )
    }
  }

  private async compressData(data: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(data)
      if (jsonString.length < this.compressionThreshold) {
        return jsonString
      }

      const encoder = new TextEncoder()
      const compressed = await compress(encoder.encode(jsonString))
      return btoa(String.fromCharCode(...compressed))
    } catch (error) {
      throw new StorageError(
        'Failed to compress data',
        'COMPRESSION_FAILED',
        { component: this.component, error }
      )
    }
  }

  private async decompressData(data: string): Promise<any> {
    try {
      // Check if data is compressed
      if (!data.match(/^[a-zA-Z0-9+/]*={0,2}$/)) {
        return JSON.parse(data)
      }

      const compressed = Uint8Array.from(atob(data), c => c.charCodeAt(0))
      const decompressed = await decompress(compressed)
      const decoder = new TextDecoder()
      return JSON.parse(decoder.decode(decompressed))
    } catch (error) {
      throw new StorageError(
        'Failed to decompress data',
        'DECOMPRESSION_FAILED',
        { component: this.component, error }
      )
    }
  }

  async getData<T>(key: string): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_error_analytics_data', {
          p_component: this.component,
          p_storage_key: key
        })

      if (error) throw error
      if (!data || data.length === 0) return null

      return await this.decompressData(data[0].data)
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(
        'Failed to retrieve data from storage',
        'GET_DATA_FAILED',
        { component: this.component, key, error }
      )
    }
  }

  async saveData<T>(key: string, data: T): Promise<void> {
    try {
      // Check quota before compression
      const quotaStatus = await this.checkQuota()
      
      if (quotaStatus.needsCleanup) {
        await this.cleanup()
      }

      const compressed = await this.compressData(data)
      const sizeBytes = new Blob([compressed]).size

      const { error } = await this.supabase
        .rpc('save_error_analytics_data', {
          p_component: this.component,
          p_storage_key: key,
          p_data: compressed,
          p_size_bytes: sizeBytes
        })

      if (error) {
        if (error.message.includes('quota exceeded')) {
          throw new StorageQuotaError(
            `Storage quota exceeded for component ${this.component}`,
            { component: this.component, key, quotaStatus }
          )
        }
        throw error
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(
        'Failed to save data to storage',
        'SAVE_DATA_FAILED',
        { component: this.component, key, error }
      )
    }
  }

  async clearData(key: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('error_analytics_storage')
        .delete()
        .match({ component: this.component, storage_key: key })

      if (error) throw error
    } catch (error) {
      throw new StorageError(
        'Failed to clear data from storage',
        'CLEAR_DATA_FAILED',
        { component: this.component, key, error }
      )
    }
  }

  async getStorageMetrics(): Promise<StorageMetrics[]> {
    try {
      const { data, error } = await this.supabase
        .from('error_analytics_storage')
        .select('storage_key, size_bytes, last_accessed')
        .eq('component', this.component)

      if (error) throw error

      return data.map(item => ({
        component: this.component,
        key: item.storage_key,
        sizeBytes: item.size_bytes,
        lastAccessed: item.last_accessed ? new Date(item.last_accessed) : null
      }))
    } catch (error) {
      throw new StorageError(
        'Failed to get storage metrics',
        'GET_METRICS_FAILED',
        { component: this.component, error }
      )
    }
  }
}

// Compression utilities using the Compression Streams API
async function compress(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream('gzip')
  const writer = cs.writable.getWriter()
  writer.write(data)
  writer.close()
  return new Response(cs.readable).arrayBuffer().then(buffer => new Uint8Array(buffer))
}

async function decompress(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('gzip')
  const writer = ds.writable.getWriter()
  writer.write(data)
  writer.close()
  return new Response(ds.readable).arrayBuffer().then(buffer => new Uint8Array(buffer))
} 
} 