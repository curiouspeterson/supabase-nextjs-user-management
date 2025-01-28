import { createClient } from '@supabase/supabase-js'
import type { Alert, AlertTemplate, AlertSeverity, AlertCategory } from '@/types/alert'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getAlerts(organizationId: string): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      template:alert_templates(*)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch alerts')
  }

  return data.map(alert => ({
    id: alert.id,
    organizationId: alert.organization_id,
    templateId: alert.template_id,
    message: alert.message,
    context: alert.context,
    severity: alert.severity as AlertSeverity,
    isResolved: alert.is_resolved,
    resolvedAt: alert.resolved_at ? new Date(alert.resolved_at) : null,
    resolvedBy: alert.resolved_by,
    resolutionNotes: alert.resolution_notes,
    createdAt: new Date(alert.created_at),
    updatedAt: new Date(alert.updated_at),
    template: alert.template ? {
      id: alert.template.id,
      organizationId: alert.template.organization_id,
      category: alert.template.category as AlertCategory,
      name: alert.template.name,
      messageTemplate: alert.template.message_template,
      severity: alert.template.severity as AlertSeverity,
      isActive: alert.template.is_active,
      contextSchema: alert.template.context_schema,
      createdAt: new Date(alert.template.created_at),
      updatedAt: new Date(alert.template.updated_at)
    } : null
  }))
}

export async function createAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
  const { data, error } = await supabase
    .from('alerts')
    .insert({
      organization_id: alert.organizationId,
      template_id: alert.templateId,
      message: alert.message,
      context: alert.context,
      severity: alert.severity,
      is_resolved: alert.isResolved,
      resolved_at: alert.resolvedAt?.toISOString(),
      resolved_by: alert.resolvedBy,
      resolution_notes: alert.resolutionNotes
    })
    .select(`
      *,
      template:alert_templates(*)
    `)
    .single()

  if (error) {
    throw new Error('Failed to create alert')
  }

  return {
    id: data.id,
    organizationId: data.organization_id,
    templateId: data.template_id,
    message: data.message,
    context: data.context,
    severity: data.severity as AlertSeverity,
    isResolved: data.is_resolved,
    resolvedAt: data.resolved_at ? new Date(data.resolved_at) : null,
    resolvedBy: data.resolved_by,
    resolutionNotes: data.resolution_notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    template: data.template ? {
      id: data.template.id,
      organizationId: data.template.organization_id,
      category: data.template.category as AlertCategory,
      name: data.template.name,
      messageTemplate: data.template.message_template,
      severity: data.template.severity as AlertSeverity,
      isActive: data.template.is_active,
      contextSchema: data.template.context_schema,
      createdAt: new Date(data.template.created_at),
      updatedAt: new Date(data.template.updated_at)
    } : null
  }
}

export async function resolveAlert(
  id: string,
  resolution: {
    resolvedBy: string
    resolutionNotes?: string
  }
): Promise<void> {
  const { error } = await supabase
    .from('alerts')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: resolution.resolvedBy,
      resolution_notes: resolution.resolutionNotes
    })
    .eq('id', id)

  if (error) {
    throw new Error('Failed to resolve alert')
  }
}

export async function getAlertTemplates(organizationId: string): Promise<AlertTemplate[]> {
  const { data, error } = await supabase
    .from('alert_templates')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch alert templates')
  }

  return data.map(template => ({
    id: template.id,
    organizationId: template.organization_id,
    category: template.category as AlertCategory,
    name: template.name,
    messageTemplate: template.message_template,
    severity: template.severity as AlertSeverity,
    isActive: template.is_active,
    contextSchema: template.context_schema,
    createdAt: new Date(template.created_at),
    updatedAt: new Date(template.updated_at)
  }))
} 