#!/bin/bash

echo "🔍 Diagnóstico del archivo .env"
echo "================================"
echo ""

# Ir a la carpeta backend
cd "$(dirname "$0")/backend"

# 1. Verificar si existe
if [ -f .env ]; then
    echo "✅ Archivo .env EXISTE en backend/"
    echo ""
else
    echo "❌ ERROR: Archivo .env NO existe en backend/"
    echo ""
    echo "Solución:"
    echo "1. Crea el archivo backend/.env"
    echo "2. Copia el contenido de backend/.env.example"
    echo "3. Agrega tu MONGODB_URI"
    echo ""
    exit 1
fi

# 2. Verificar que tenga MONGODB_URI
if grep -q "MONGODB_URI" .env; then
    echo "✅ Variable MONGODB_URI encontrada"
    echo ""
    
    # Mostrar la línea (sin mostrar el valor completo por seguridad)
    MONGODB_LINE=$(grep "MONGODB_URI" .env)
    if [[ $MONGODB_LINE == *"mongodb"* ]]; then
        echo "✅ MONGODB_URI contiene 'mongodb'"
        echo "Formato: ${MONGODB_LINE:0:50}..."
    else
        echo "⚠️  MONGODB_URI no parece tener un connection string válido"
        echo "Línea actual: $MONGODB_LINE"
    fi
else
    echo "❌ Variable MONGODB_URI NO encontrada en .env"
    echo ""
    echo "Agrega esta línea a backend/.env:"
    echo "MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/"
    exit 1
fi

echo ""

# 3. Verificar formato (sin espacios extra, sin comillas)
MONGODB_VALUE=$(grep "MONGODB_URI" .env | cut -d'=' -f2-)

if [[ $MONGODB_VALUE == \"*\" ]] || [[ $MONGODB_VALUE == \'*\' ]]; then
    echo "⚠️  ADVERTENCIA: MONGODB_URI tiene comillas"
    echo "   Quita las comillas del valor"
    echo ""
fi

if [[ $MONGODB_VALUE == *" "* ]]; then
    echo "⚠️  ADVERTENCIA: MONGODB_URI tiene espacios"
    echo "   Quita los espacios alrededor del ="
    echo ""
fi

# 4. Verificar otras variables importantes
echo "Verificando otras variables:"

if grep -q "SUPER_ADMIN_KEY" .env; then
    echo "✅ SUPER_ADMIN_KEY configurada"
else
    echo "⚠️  SUPER_ADMIN_KEY no configurada (opcional)"
fi

if grep -q "PORT" .env; then
    PORT=$(grep "PORT" .env | cut -d'=' -f2)
    echo "✅ PORT configurado: $PORT"
else
    echo "ℹ️  PORT no configurado (usará 3001 por defecto)"
fi

echo ""
echo "================================"
echo "📝 Contenido del archivo .env:"
echo "================================"
cat .env
echo ""
echo "================================"

echo ""
echo "✅ Diagnóstico completo"
echo ""
echo "Si ves errores arriba, corrígelos antes de iniciar el servidor."
