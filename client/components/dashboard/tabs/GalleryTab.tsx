import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Sanitize storage path to prevent path traversal
const sanitizeStoragePath = (p: string) => p.replace(/\.\.[\/\\]/g, '').replace(/^\/+/, '');


const MAX_GALLERY_BYTES = 104857600 // 100MB
const MAX_FILE_BYTES = 10485760 // 10MB

const compressImage = async (file: File): Promise<Blob> => {
  const img = new Image()
  img.src = URL.createObjectURL(file)
  await new Promise(r => img.onload = r)
  const canvas = document.createElement('canvas')
  const maxW = 1920
  const scale = Math.min(1, maxW / img.width)
  canvas.width = img.width * scale
  canvas.height = img.height * scale
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  return new Promise(r => canvas.toBlob(blob => r(blob!), 'image/jpeg', 0.8))
}

export function GalleryTab({ painter }: { painter: any }) {
  const [images, setImages] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadGallery()
  }, [painter?.id])

  const loadGallery = async () => {
    if (!painter?.id) return
    const { data } = await supabase
      .from('painter_gallery')
      .select('*')
      .eq('painter_id', painter.id)
      .order('uploaded_at', { ascending: false })
    if (data) setImages(data)
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || !painter?.id) return
    setError('')
    for (const file of Array.from(files)) {
      if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
        setError('Only JPG, PNG and WebP files are accepted.')
        continue
      }
      if (file.size > MAX_FILE_BYTES) {
        setError('File must be under 10MB.')
        continue
      }
      setUploading(true)
      try {
        const compressed = await compressImage(file)
        if (painter.gallery_size_bytes + compressed.size > MAX_GALLERY_BYTES) {
          setError('Gallery full (100MB limit). Delete images to upload more.')
          setUploading(false)
          return
        }
        const path = sanitizeStoragePath(`${painter.id}/${Date.now()}_${file.name}`)
        const { error: uploadError } = await supabase.storage
          .from('painter-gallery')
          .upload(path, compressed)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage
          .from('painter-gallery')
          .getPublicUrl(path)
        await supabase.from('painter_gallery').insert({
          painter_id: painter.id,
          image_url: publicUrl,
          image_size_bytes: compressed.size,
        })
        await supabase.from('painters')
          .update({ gallery_size_bytes: painter.gallery_size_bytes + compressed.size })
          .eq('id', painter.id)
        await loadGallery()
      } catch (err) {
        setError('Upload failed. Please try again.')
      }
      setUploading(false)
    }
  }

  const handleDelete = async (image: any) => {
    const path = image.image_url.split('/painter-gallery/')[1]
    await supabase.storage.from('painter-gallery').remove([path])
    await supabase.from('painter_gallery').delete().eq('id', image.id)
    await supabase.from('painters')
      .update({ gallery_size_bytes: Math.max(0, painter.gallery_size_bytes - image.image_size_bytes) })
      .eq('id', painter.id)
    setDeleteConfirm(null)
    await loadGallery()
  }

  const usedMB = ((painter?.gallery_size_bytes || 0) / 1048576).toFixed(1)
  const usedPct = Math.min(100, ((painter?.gallery_size_bytes || 0) / MAX_GALLERY_BYTES) * 100)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Storage used</span>
          <span className="text-white">{usedMB} MB / 100 MB</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${usedPct}%` }} />
        </div>
      </div>

      {error && <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded">{error}</div>}

      <label className="block border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
        <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp"
          multiple onChange={e => handleUpload(e.target.files)} disabled={uploading} />
        <div className="text-gray-400">
          {uploading ? 'Uploading...' : 'Drop images here or click to upload'}
          <p className="text-xs mt-1">JPG, PNG, WebP — max 10MB per image</p>
        </div>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map(img => (
          <div key={img.id} className="bg-gray-800 rounded-lg overflow-hidden">
            <img src={img.image_url} alt={img.caption || 'Gallery image'}
              className="w-full h-48 object-cover" />
            <div className="p-3">
              <p className="text-white text-sm">{img.caption || 'No caption'}</p>
              <p className="text-gray-500 text-xs mt-1">
                {new Date(img.uploaded_at).toLocaleDateString()} · 
                {(img.image_size_bytes / 1024).toFixed(0)} KB
              </p>
              <button onClick={() => setDeleteConfirm(img.id)}
                className="mt-2 text-red-400 text-xs hover:text-red-300">
                Delete
              </button>
            </div>
            {deleteConfirm === img.id && (
              <div className="p-3 bg-red-900/30 border-t border-red-800">
                <p className="text-red-300 text-xs mb-2">Delete this image?</p>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(img)}
                    className="bg-red-600 text-white text-xs px-3 py-1 rounded">Confirm</button>
                  <button onClick={() => setDeleteConfirm(null)}
                    className="bg-gray-700 text-white text-xs px-3 py-1 rounded">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
