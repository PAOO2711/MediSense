'use client';

import { useEffect, useState } from "react";

export default function AudioRecorder() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [transcription, setTranscription] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    // Crear WebSocket al iniciar componente
    const websocket = new WebSocket("ws://localhost:8000/ws/transcribe");

    websocket.onopen = () => console.log("WebSocket conectado");

    websocket.onmessage = (event) => {
      const textoParcial = event.data;

      // Concatenar texto parcial de manera acumulativa
      setTranscription((prev) => {
        // Evitar duplicados simples
        if (!prev.endsWith(textoParcial)) {
          return prev + " " + textoParcial;
        }
        return prev;
      });
    };

    websocket.onclose = () => console.log("WebSocket cerrado");
    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const startRecording = async () => {
    if (!ws) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const arrayBuffer = await event.data.arrayBuffer();
        ws.send(arrayBuffer);
      }
    };

    recorder.start(1000); // enviar chunks cada 1 segundo
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Transcripción en tiempo real</h2>
      <button onClick={startRecording}>🎤 Iniciar grabación</button>
      <button onClick={stopRecording} style={{ marginLeft: "10px" }}>
        ⏹ Detener
      </button>
      <div
        style={{
          marginTop: "20px",
          whiteSpace: "pre-wrap",
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "150px",
        }}
      >
        {transcription}
      </div>
    </div>
  );
}
