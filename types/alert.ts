/**
 * Alert-related type definitions
 */

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type AlertCategory = 
  | 'SYSTEM'
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'BUSINESS'
  | 'COMPLIANCE'

export interface AlertTemplate {
  id: string
  organizationId: string
  category: AlertCategory
  name: string
  messageTemplate: string
  severity: AlertSeverity
  isActive: boolean
  contextSchema: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface Alert {
  id: string
  organizationId: string
  templateId: string
  message: string
  context: Record<string, unknown>
  severity: AlertSeverity
  isResolved: boolean
  resolvedAt: Date | null
  resolvedBy: string | null
  resolutionNotes: string | null
  createdAt: Date
  updatedAt: Date
  template: AlertTemplate | null
} 