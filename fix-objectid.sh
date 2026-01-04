#!/bin/bash

echo "🔄 Actualizando referencias de MongoDB ObjectId..."

files=(
  "src/pages/admin/RacesPage.tsx"
  "src/pages/admin/ResultsPage.tsx"
  "src/pages/admin/DriversPage.tsx"
  "src/pages/admin/TeamsPage.tsx"
  "src/pages/public/PublicConstructors.tsx"
  "src/pages/public/PublicDrivers.tsx"
  "src/pages/public/PublicCalendar.tsx"
  "src/pages/public/PublicHome.tsx"
  "src/pages/public/PublicLayout.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "   Actualizando $file..."
    sed -i 's/\._id\.\$oid/_id/g' "$file"
  fi
done

echo "✅ Actualización completada!"
