#!/bin/bash

echo "🏎️  Iniciando Monoposto Championship Manager..."
echo ""

# Verificar si existe .env en backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No se encontró backend/.env"
    echo "📝 Crea el archivo backend/.env usando backend/.env.example como referencia"
    echo ""
    exit 1
fi

# Verificar si existe .env en frontend
if [ ! -f ".env" ]; then
    echo "⚠️  No se encontró .env en la raíz"
    echo "📝 Crea el archivo .env usando .env.example como referencia"
    echo ""
    exit 1
fi

# Iniciar backend
echo "🔧 Iniciando backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar frontend
echo "🎨 Iniciando frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Aplicación iniciada:"
echo "   Backend: http://localhost:3001/api"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores"

# Manejar Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Esperar indefinidamente
wait
