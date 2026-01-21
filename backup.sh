#!/bin/bash
# Meal Planner - Backup Script
# Creates a timestamped backup of your meal data

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="meal-planner-backup-${TIMESTAMP}.tar.gz"

echo "💾 Meal Planner Backup Script"
echo "================================"
echo ""

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Check if volume exists
if ! docker volume inspect meal-planner-data &> /dev/null; then
    echo "❌ No meal-planner-data volume found!"
    echo "   Make sure the meal planner is set up first."
    exit 1
fi

# Create backup
echo "📦 Creating backup..."
docker run --rm \
  -v meal-planner-data:/data \
  -v $(pwd)/${BACKUP_DIR}:/backup \
  alpine tar czf /backup/${BACKUP_FILE} -C /data .

echo "✅ Backup created: ${BACKUP_DIR}/${BACKUP_FILE}"
echo ""

# Show backup info
BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
echo "📊 Backup size: ${BACKUP_SIZE}"
echo ""

# List all backups
echo "📂 All backups:"
ls -lh ${BACKUP_DIR}/*.tar.gz 2>/dev/null || echo "   No backups found"
echo ""

echo "✅ Done!"
echo ""
echo "To restore this backup:"
echo "  docker run --rm -v meal-planner-data:/data -v \$(pwd)/${BACKUP_DIR}:/backup alpine tar xzf /backup/${BACKUP_FILE} -C /data"