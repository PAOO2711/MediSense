// components/full-audio-recorder.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, Square, Upload, Download } from 'lucide-react'

interface TranscriptionSegment {
  start: number
  end: number
  text: string
}

interface TranscriptionResult {
  type: string
  full_text: string
  segments: TranscriptionSegment[]
  duration: number
  language: string
  language_probability: number
}

export default function FullAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [status, setStatus] = useState<string>('Listo para grabar')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setStatus('Solicitando permisos de micrófono...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      })

      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Eventos del MediaRecorder
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setStatus('Procesando grabación...')
        setIsProcessing(true)

        // Crear blob con toda la grabación
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // Enviar para transcripción
        await transcribeAudio(audioBlob)
        
        // Limpiar stream
        stream.getTracks().forEach(track => track.stop())
      }

      // Iniciar grabación
      mediaRecorder.start(1000) // Chunk cada segundo
      setIsRecording(true)
      setRecordingTime(0)
      setStatus('🔴 Grabando...')

      // Timer para mostrar tiempo de grabación
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error iniciando grabación:', error)
      setStatus('❌ Error accediendo al micrófono')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // Opción 1: Usar endpoint HTTP para subir archivo
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')

      const response = await fetch('http://localhost:8000/transcribe_file', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setTranscriptionResult({
          type: 'transcription_complete',
          full_text: result.full_text,
          segments: result.segments,
          duration: result.duration,
          language: result.language,
          language_probability: result.language_probability
        })
        setStatus('✅ Transcripción completada')
      } else {
        setStatus(`❌ Error: ${result.error}`)
      }

    } catch (error) {
      console.error('Error transcribiendo:', error)
      setStatus('❌ Error en transcripción')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTranscription = () => {
    if (!transcriptionResult) return

    const content = `Transcripción de Audio
=====================

Texto completo:
${transcriptionResult.full_text}

Detalles:
- Duración: ${transcriptionResult.duration}s
- Idioma: ${transcriptionResult.language} (${(transcriptionResult.language_probability * 100).toFixed(1)}%)
- Segmentos: ${transcriptionResult.segments.length}

Transcripción por segmentos:
${transcriptionResult.segments.map(segment => 
  `[${segment.start}s - ${segment.end}s] ${segment.text}`
).join('\n')}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcripcion_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Control de Grabación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Grabación Completa de Audio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado y tiempo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={isRecording ? "destructive" : "secondary"}>
                {status}
              </Badge>
              {isRecording && (
                <span className="text-lg font-mono">
                  {formatTime(recordingTime)}
                </span>
              )}
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-3">
            {!isRecording && !isProcessing && (
              <Button onClick={startRecording} className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Iniciar Grabación
              </Button>
            )}
            
            {isRecording && (
              <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Detener y Transcribir
              </Button>
            )}

            {isProcessing && (
              <Button disabled className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                Procesando...
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultado de Transcripción */}
      {transcriptionResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resultado de la Transcripción</CardTitle>
              <Button onClick={downloadTranscription} variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Información general */}
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Duración: {transcriptionResult.duration}s</span>
              <span>Idioma: {transcriptionResult.language}</span>
              <span>Confianza: {(transcriptionResult.language_probability * 100).toFixed(1)}%</span>
              <span>Segmentos: {transcriptionResult.segments.length}</span>
            </div>

            {/* Texto completo */}
            <div>
              <h4 className="font-semibold mb-2">Texto completo:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 leading-relaxed">
                  {transcriptionResult.full_text}
                </p>
              </div>
            </div>

            {/* Segmentos con timestamps */}
            <div>
              <h4 className="font-semibold mb-2">Transcripción por segmentos:</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transcriptionResult.segments.map((segment, index) => (
                  <div key={index} className="flex gap-3 p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-500 font-mono min-w-20">
                      [{segment.start}s - {segment.end}s]
                    </span>
                    <span className="text-gray-800">{segment.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2">Instrucciones:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>1. Haz clic en "Iniciar Grabación" para comenzar</li>
            <li>2. Habla durante todo el tiempo que necesites</li>
            <li>3. Haz clic en "Detener y Transcribir" cuando termines</li>
            <li>4. Espera a que se procese la grabación completa</li>
            <li>5. Obtén la transcripción con timestamps detallados</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}