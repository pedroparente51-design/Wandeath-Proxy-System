#!/bin/bash

# Script de configuração inicial da VPS para Wandeath VIP
# Este script deve ser executado com permissões de sudo ou como usuário com privilégios de sudo.

set -e

DOMAIN="wandeath.com"
WEB_ROOT="/var/www/$DOMAIN"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
DEPLOY_USER="deployer"

echo "🚀 Iniciando configuração para $DOMAIN..."

# 1. Garantir que o diretório existe
if [ ! -d "$WEB_ROOT" ]; then
    echo "📂 Criando diretório $WEB_ROOT..."
    sudo mkdir -p "$WEB_ROOT"
fi

# 2. Ajustar permissões para o usuário de deploy
echo "🔑 Ajustando permissões para $DEPLOY_USER..."
sudo chown -R $DEPLOY_USER:www-data "$WEB_ROOT"
sudo chmod -R 775 "$WEB_ROOT"

# 3. Copiar configuração do Nginx (se o arquivo existir no repo)
if [ -f "$WEB_ROOT/infra/nginx/$DOMAIN.conf" ]; then
    echo "⚙️ Instalando configuração do Nginx..."
    sudo cp "$WEB_ROOT/infra/nginx/$DOMAIN.conf" "$NGINX_CONF"
    
    # Criar link simbólico se não existir
    if [ ! -f "/etc/nginx/sites-enabled/$DOMAIN" ]; then
        sudo ln -s "$NGINX_CONF" "/etc/nginx/sites-enabled/"
    fi
    
    # Testar e recarregar Nginx
    echo "🔄 Testando e recarregando Nginx..."
    sudo nginx -t && sudo systemctl reload nginx
else
    echo "⚠️ Aviso: Configuração do Nginx não encontrada em $WEB_ROOT/infra/nginx/$DOMAIN.conf"
    echo "Certifique-se de que o código foi baixado no diretório correto antes de rodar este script."
fi

echo "✅ Configuração básica concluída!"
echo "DICA: Para ativar SSL, execute: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
