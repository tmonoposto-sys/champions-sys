#!/bin/bash

echo "🏎️  Monoposto Championship - Inicio Unificado"
echo ""

# Verificar si existe .env en backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No se encontró backend/.env"
    echo "📝 Crea el archivo backend/.env usando backend/.env.example como referencia"
    echo ""
    exit 1
fi

# Función para instalar dependencias si es necesario
install_if_needed() {
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependencias del frontend..."
        npm install
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        echo "📦 Instalando dependencias del backend..."
        cd backend && npm install && cd ..
    fi
}

# Verificar instalación
install_if_needed

echo ""
echo "🔨 Compilando frontend..."
npm run build

echo ""
echo "🚀 Iniciando servidor..."
cd backend && npm start
