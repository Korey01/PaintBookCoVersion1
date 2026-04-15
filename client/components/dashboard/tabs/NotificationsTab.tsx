import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function NotificationsTab({ painter }: { painter: any }) {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!painter?.id) return
    loadNotifications()
    const channel = supabase
      .channel('painter-jobs')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'jobs',
        filter: `assigned_painter_id=eq.${painter.id}`
      }, () => loadNotifications())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [painter?.id])

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('id, title, status, updated_at')
      .eq('assigned_painter_id', painter.id)
      .order('updated_at', { ascending: false })
      .limit(20)
    if (data) {
      setNotifications(data.map(job => ({
        id: job.id,
        title: statusToTitle(job.status),
        description: job.title,
        time: job.updated_at,
        read: false,
        icon: statusToIcon(job.status),
      })))
    }
  }

  const statusToTitle = (status: string) => {
    const map: Record<string, string> = {
      escrow_funded: 'Payment received — job confirmed',
      in_progress: 'Job started',
      milestone_review: 'Milestone under review',
      completed: 'Job completed — payment released',
      disputed: 'Dispute raised',
      cancelled: 'Job cancelled',
    }
    return map[status] || `Job status: ${status}`
  }

  const statusToIcon = (status: string) => {
    if (status === 'completed') return '✓'
    if (status === 'disputed') return '⚠'
    if (status === 'escrow_funded') return '£'
    return '•'
  }

  const markRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  return (
    <div className="space-y-3">
      {notifications.length === 0 && (
        <p className="text-gray-500 text-center py-8">No notifications yet</p>
      )}
      {notifications.map(n => (
        <div key={n.id}
          onClick={() => markRead(n.id)}
          className={`p-4 rounded-lg border cursor-pointer transition-colors
            ${n.read
              ? 'bg-gray-900 border-gray-800 text-gray-500'
              : 'bg-gray-800 border-gray-700 text-white'}`}>
          <div className="flex items-start gap-3">
            <span className="text-blue-400 text-lg w-6 text-center">{n.icon}</span>
            <div className="flex-1">
              <p className={`font-medium text-sm ${n.read ? 'text-gray-500' : 'text-white'}`}>
                {n.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{n.description}</p>
              <p className="text-xs text-gray-600 mt-1">
                {new Date(n.time).toLocaleString()}
              </p>
            </div>
            {!n.read && (
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
