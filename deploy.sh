#!/bin/bash
# =============================================================
# SOCIETRA ERP - GoDaddy VPS Deployment Script
# Run this ONCE on a fresh GoDaddy VPS (Ubuntu 22.04 LTS)
# Usage: bash deploy.sh
# =============================================================

set -e  # Exit on any error

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   SOCIETRA ERP - GoDaddy VPS Deployer   ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── CONFIG ────────────────────────────────────────────────────
REPO_URL="https://github.com/milinddere76-sketch/SOCIETRA-ERP.git"
APP_DIR="/opt/societra"
DOMAIN="societra.in"           # <-- Change to your GoDaddy domain
POSTGRES_PASSWORD="SocietraDB@2025!"  # <-- Change this!
JWT_SECRET="SocietraJWTSecretKeyForHS256WithAtLeast64Characters_ChangeThis"
MAIL_USERNAME=""               # <-- Your Gmail for sending emails
MAIL_PASSWORD=""               # <-- Gmail App Password

# ── 1. SYSTEM UPDATES ─────────────────────────────────────────
echo "[ 1/7 ] Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git ufw

# ── 2. INSTALL DOCKER ─────────────────────────────────────────
echo "[ 2/7 ] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
    echo "Docker installed ✓"
else
    echo "Docker already installed ✓"
fi

# Install Docker Compose v2
if ! docker compose version &> /dev/null; then
    curl -SL https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64 \
         -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    echo "Docker Compose installed ✓"
fi

# ── 3. CLONE / UPDATE REPO ────────────────────────────────────
echo "[ 3/7 ] Cloning repository from GitHub..."
if [ -d "$APP_DIR/.git" ]; then
    echo "Repo exists. Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# ── 4. WRITE ENVIRONMENT FILE ─────────────────────────────────
echo "[ 4/7 ] Writing .env configuration..."
cat > "$APP_DIR/.env" << EOF
# Database
POSTGRES_DB=chs_society
POSTGRES_USER=chs_admin
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Spring Boot
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/chs_society
SPRING_DATASOURCE_USERNAME=chs_admin
SPRING_DATASOURCE_PASSWORD=${POSTGRES_PASSWORD}
SPRING_PROFILES_ACTIVE=prod

# Security
JWT_SECRET=${JWT_SECRET}

# Razorpay (update when live)
RAZORPAY_KEY_ID=rzp_live_your_key_here
RAZORPAY_KEY_SECRET=your_secret_here

# WhatsApp
WHATSAPP_API_URL=https://api.interakt.ai/v1/public/message/
WHATSAPP_API_KEY=your_whatsapp_api_key

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=${MAIL_USERNAME}
MAIL_PASSWORD=${MAIL_PASSWORD}
MAIL_FROM=noreply@${DOMAIN}

# App domain
APP_DOMAIN=${DOMAIN}
EOF
chmod 600 "$APP_DIR/.env"
echo ".env written ✓"

# ── 5. FIREWALL ───────────────────────────────────────────────
echo "[ 5/7 ] Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 81/tcp    # Nginx Proxy Manager Admin
ufw --force enable
echo "Firewall configured ✓"

# ── 6. BUILD & START SERVICES ─────────────────────────────────
echo "[ 6/7 ] Building & starting Docker containers..."
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml --env-file .env down --remove-orphans 2>/dev/null || true
docker compose -f docker-compose.prod.yml --env-file .env build --no-cache
docker compose -f docker-compose.prod.yml --env-file .env up -d

echo "Waiting for services to start..."
sleep 20
docker compose -f docker-compose.prod.yml ps

# ── 7. DONE ───────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║              DEPLOYMENT COMPLETE!            ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  App URL:   http://${DOMAIN}           ║"
echo "║  NPM Admin: http://$(curl -s ifconfig.me):81  ║"
echo "║                                              ║"
echo "║  NEXT STEPS (NPM Admin → http://IP:81):      ║"
echo "║  1. Login: admin@example.com / changeme      ║"
echo "║  2. Add Proxy Host for your domain           ║"
echo "║  3. Enable SSL (Let's Encrypt)               ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
