# Nginx + Certbot Setup (Alternative to Caddy)

If you prefer Nginx over Caddy, follow these instructions.

> **Note**: Caddy is recommended for its simplicity and automatic HTTPS. Only use Nginx if you have specific requirements.

## Prerequisites

- Next.js app running on port 3000 via Docker
- Domain name pointed to your droplet's IP address

## Installation

### Step 1: Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### Step 2: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/technical-blog
```

Add the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

### Step 3: Enable the Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/technical-blog /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Step 4: Install Certbot for SSL

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: yes)
```

### Step 5: Verify Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Check timer status
sudo systemctl status certbot.timer
```

## Maintenance

### View Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Reload Configuration

```bash
# After editing config
sudo nginx -t
sudo systemctl reload nginx
```

### Manual Certificate Renewal

```bash
# Renew all certificates
sudo certbot renew

# Renew specific domain
sudo certbot renew --cert-name yourdomain.com
```

### Check Certificate Status

```bash
# List all certificates
sudo certbot certificates

# Check expiration
sudo certbot certificates | grep -A 2 yourdomain.com
```

## Troubleshooting

### Nginx won't start

```bash
# Check configuration syntax
sudo nginx -t

# Check port 80/443 availability
sudo netstat -tulpn | grep -E ':(80|443)'

# View detailed logs
sudo journalctl -u nginx -n 50
```

### SSL certificate issues

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check Nginx includes SSL config
sudo cat /etc/nginx/sites-enabled/technical-blog | grep ssl
```

### 502 Bad Gateway

This usually means Nginx can't reach the Next.js app:

```bash
# Check if app is running
docker ps | grep technical-blog

# Check if port 3000 is accessible
curl http://localhost:3000/api/health

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Uninstall (Switch to Caddy)

If you want to switch to Caddy:

```bash
# Stop and disable Nginx
sudo systemctl stop nginx
sudo systemctl disable nginx

# Remove certbot (Caddy handles SSL)
sudo apt remove certbot python3-certbot-nginx

# Follow Caddy installation steps in main README
```
