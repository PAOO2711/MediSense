import AudioRecorder from '@/components/audio-recorder'

export default function RecorderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Grabación Completa de Audio
          </h1>
          <p className="text-gray-600">
            Graba toda tu conversación y obtén una transcripción completa con timestamps
          </p>
        </div>
        
        <AudioRecorder />
      </div>
    </div>
  )
}
