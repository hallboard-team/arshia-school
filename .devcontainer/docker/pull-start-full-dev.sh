#!/bin/bash
# ---------------------------------------------------------
# Pull & Start FULL Dev Stack (Backend + Frontend + MongoDB)
#
# Usage:
#   ./pull-start-full-dev.sh [api_port] [frontend_port] [dotnet_version] [node_version] [angular_version] [mongo_version] [project_name]
#
# Example:
#   ./pull-start-full-dev.sh 5002 4202 10.0 24 21 7.0 myproject
#
# Starts:
#   - dev-full (dotnet + node + angular)
#   - mongo db (version specified)
# ---------------------------------------------------------

set -euo pipefail
cd "$(dirname "$0")"

API_PORT="${1:-5002}"
FRONTEND_PORT="${2:-4202}"
DOTNET_VERSION="${3:-10.0}"
NODE_VERSION="${4:-24}"
ANGULAR_VERSION="${5:-21}"
MONGO_VERSION="${6:-7.0}"
COMPOSE_PROJECT_NAME="${7:-${COMPOSE_PROJECT_NAME:-template}}"

IMAGE="ghcr.io/hallboard-team/fullstack-dev:dotnet${DOTNET_VERSION}-node${NODE_VERSION}-ng${ANGULAR_VERSION}"
CONTAINER_NAME="${COMPOSE_PROJECT_NAME}_dev-full"

COMPOSE_FILE="docker-compose.full.yml"

echo "=========================================="
echo " FULL DEV STACK STARTER"
echo "------------------------------------------"
echo " API PORT:          $API_PORT"
echo " FRONTEND PORT:     $FRONTEND_PORT"
echo " DOTNET VERSION:    $DOTNET_VERSION"
echo " NODE VERSION:      $NODE_VERSION"
echo " ANGULAR VERSION:   $ANGULAR_VERSION"
echo " MONGO VERSION:     $MONGO_VERSION"
echo " PROJECT NAME:      $COMPOSE_PROJECT_NAME"
echo " IMAGE:             $IMAGE"
echo "=========================================="

# ---------------------------------------------------------
# Fix VS Code shared cache permissions
# ---------------------------------------------------------
sudo rm -rf ~/.cache/vscode-server-shared || true
mkdir -p ~/.cache/vscode-server-shared/bin
sudo chown -R 1000:1000 ~/.cache/vscode-server-shared || true

# ---------------------------------------------------------
# Ensure dev-full image exists (pull if needed)
# ---------------------------------------------------------
if docker image exists "$IMAGE"; then
  echo "🧱 Image '$IMAGE' already exists locally — skipping pull."
else
  echo "📥 Pulling dev image '$IMAGE' from GHCR..."
  if ! docker pull "$IMAGE"; then
    echo "❌ Failed to pull '$IMAGE'. Check GHCR auth & image name."
    exit 1
  fi
fi

echo "🚀 Starting FULL dev stack container '$CONTAINER_NAME'..."

# ---------------------------------------------------------
# Start full stack via compose
# ---------------------------------------------------------
if COMPOSE_PROJECT_NAME="$COMPOSE_PROJECT_NAME" \
   DOTNET_VERSION="$DOTNET_VERSION" \
   NODE_VERSION="$NODE_VERSION" \
   ANGULAR_VERSION="$ANGULAR_VERSION" \
   MONGO_VERSION="$MONGO_VERSION" \
   API_PORT="$API_PORT" \
   FRONTEND_PORT="$FRONTEND_PORT" \
   docker-compose -f "$COMPOSE_FILE" up -d; then

  if docker ps --filter "name=$CONTAINER_NAME" --format '{{.Names}}' \
        | grep -q "$CONTAINER_NAME"; then
    echo "✅ FULL dev stack '$CONTAINER_NAME' started successfully!"
    echo "   API:      http://localhost:$API_PORT"
    echo "   Frontend: http://localhost:$FRONTEND_PORT"
  else
    echo "❌ Container '$CONTAINER_NAME' did not start properly."
    exit 1
  fi
else
  echo "❌ docker-compose failed to start '$CONTAINER_NAME'."
  exit 1
fi
