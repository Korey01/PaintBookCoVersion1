import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function AvailabilityTab({ painter }: { painter: any }) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()

  const toggleDate = (dateStr: string) => {
    setUnavailableDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    )
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const available = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      if (!unavailableDates.includes(dateStr)) available.push(dateStr)
    }
    await supabase.from('painters').update({
      available_from: available[0] || null,
      available_to: available[available.length-1] || null,
    }).eq('id', painter.id)
    setSaving(false)
    setSaved(true)
  }

  const monthNames = ['January','February','March','April','May','June',
    'July','August','September','October','November','December']

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center justify-between">
        <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y-1) } else setCurrentMonth(m => m-1) }}
          className="text-gray-400 hover:text-white p-2">◀</button>
        <h3 className="text-white font-medium">{monthNames[currentMonth]} {currentYear}</h3>
        <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y+1) } else setCurrentMonth(m => m+1) }}
          className="text-gray-400 hover:text-white p-2">▶</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const d = i + 1
          const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
          const isToday = dateStr === today.toISOString().split('T')[0]
          const isUnavailable = unavailableDates.includes(dateStr)
          return (
            <button key={d} onClick={() => toggleDate(dateStr)}
              className={`aspect-square rounded text-sm font-medium transition-colors
                ${isUnavailable ? 'bg-gray-700 text-gray-500' : 'bg-green-900/50 text-green-300 hover:bg-green-800'}
                ${isToday ? 'ring-2 ring-orange-500' : ''}`}>
              {d}
            </button>
          )
        })}
      </div>

      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-900/50 inline-block" />Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-700 inline-block" />Unavailable</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded ring-2 ring-orange-500 inline-block" />Today</span>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
        {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Availability'}
      </button>
    </div>
  )
}
