#!/bin/bash

# Script para iniciar ambos servicios en desarrollo

echo "🚀 Iniciando MediSense..."

# Función para limpiar procesos al salir
cleanup() {
    echo "🛑 Deteniendo servicios..."
    kill %1 %2 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

# Verificar si node_modules existe en frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    cd frontend && npm install && cd ..
fi

# Verificar si existe entorno virtual para backend
if [ ! -d "backend/venv" ]; then
    echo "🐍 Creando entorno virtual para backend..."
    cd backend && python3 -m venv venv && cd ..
fi

# Activar entorno virtual e instalar dependencias
echo "📦 Instalando dependencias del backend..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Iniciar backend
echo "🔧 Iniciando backend (FastAPI)..."
cd backend && source venv/bin/activate && python3 app/main.py &
cd ..

# Esperar un poco para que el backend se inicie
sleep 3

# Iniciar frontend
echo "⚡ Iniciando frontend (Next.js)..."
cd frontend && npm run dev &
cd ..

echo "✅ Servicios iniciados:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔗 Backend:  http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener ambos servicios"

# Esperar a que se presione Ctrl+C
wait