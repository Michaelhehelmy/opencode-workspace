#!/bin/bash
# =============================================================================
# OpenCode Workspace — Setup & Template Renderer
# Usage: bash .opencode/setup.sh
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${1}${NC}"; }

log "${GREEN}========================================${NC}"
log "${GREEN}  OpenCode Universal Setup & Renderer   ${NC}"
log "${GREEN}========================================${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── 1. Node.js check ─────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  log "${RED}ERROR: Node.js is required to render workspace templates.${NC}"
  exit 1
fi
NODE_VERSION=$(node --version)
log "${GREEN}✅ Node.js: $NODE_VERSION${NC}"

# ── 2. Install Renderer & MCP dependencies ───────────────────────────────────
log "${YELLOW}📦 Installing workspace dependencies (mustache + MCPs)...${NC}"
npm install --prefer-offline 2>/dev/null || npm install
log "${GREEN}✅ Workspace dependencies installed${NC}"

# ── 3. Render Templates ──────────────────────────────────────────────────────
log "${YELLOW}⚙️  Generating project configuration and agent assets...${NC}"
node lib/render.js

# ── 4. Verify OpenCode installation ──────────────────────────────────────────
log "${YELLOW}🔍 Checking OpenCode installation...${NC}"
if command -v opencode &>/dev/null; then
  log "${GREEN}  ✅ OpenCode is installed${NC}"
else
  log "${YELLOW}  ⚠️  OpenCode not found. Install it: curl -fsSL https://opencode.ai/install | sh${NC}"
fi

log "${GREEN}========================================${NC}"
log "${GREEN}  ✅ Workspace bootstrap complete!      ${NC}"
log "${GREEN}========================================${NC}"
log "Run 'opencode' in the project root to start."
log ""
