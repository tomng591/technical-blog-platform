# Deployment Quick Reference

## Before Deploying

**CRITICAL**: Always run pre-deployment checks locally first:

```bash
npm run pre-deploy
```

Or push your code - the pre-push Git hook will automatically run these checks.

## Deploying to DigitalOcean Droplet

### SSH into your droplet

```bash
ssh root@your-droplet-ip
# or
ssh your-username@your-droplet-ip
```

### Update and Deploy

```bash
# Navigate to project directory
cd ~/technical-blog-platform

# Pull latest changes
git pull origin main

# Rebuild Docker image
docker build -t technical-blog:latest .

# Stop and remove old container
docker stop technical-blog
docker rm technical-blog

# Start new container
docker run -d \
  --name technical-blog \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  technical-blog:latest

# Check logs
docker logs technical-blog -f
```

### Quick Commands

```bash
# View logs
docker logs technical-blog --tail=100 -f

# Restart container
docker restart technical-blog

# Check status
docker ps | grep technical-blog

# Check health
curl http://localhost:3000/api/health
curl https://yourdomain.com/api/health

# View resource usage
docker stats technical-blog
```

### Troubleshooting

#### Build fails on droplet

1. **Check locally first**: Always run `npm run pre-deploy` before pushing
2. **Check droplet resources**: `df -h` and `free -m`
3. **View full build logs**: `docker build -t technical-blog:latest . 2>&1 | tee build.log`
4. **Clean up Docker**: `docker system prune -a` (frees space)

#### Container won't start

```bash
# Check detailed logs
docker logs technical-blog

# Inspect container
docker inspect technical-blog

# Check if port is already in use
sudo netstat -tulpn | grep 3000
```

#### SSL issues

```bash
# Test SSL certificate renewal
sudo certbot renew --dry-run

# Check Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Rollback Procedure

If deployment fails:

```bash
# Find previous image
docker images | grep technical-blog

# Run previous version (use image ID)
docker run -d \
  --name technical-blog \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  <previous-image-id>

# Or restore from backup
cd ~/backups
gunzip -c blog-image-YYYYMMDD_HHMMSS.tar.gz | docker load
```

## Common Errors

### "Type error: 'X' is specified more than once"

- **Cause**: Props are being passed both explicitly and via spread operator
- **Fix**: Destructure the conflicting prop and only pass it once
- **Prevention**: Run `npm run type-check` before deploying

### "Module not found"

- **Cause**: Missing dependency or incorrect import path
- **Fix**: Run `npm install` and check imports
- **Prevention**: Run `npm run build` locally before deploying

### "ENOSPC: no space left on device"

- **Cause**: Droplet disk is full
- **Fix**:
  ```bash
  docker system prune -a
  sudo apt autoremove
  sudo apt clean
  ```

## Monitoring Checklist

After each deployment:

- [ ] Check logs: `docker logs technical-blog --tail=50`
- [ ] Test health endpoint: `curl https://yourdomain.com/api/health`
- [ ] Verify homepage loads: Open browser to your domain
- [ ] Check SSL certificate: Browser should show secure connection
- [ ] Monitor for 5-10 minutes to ensure stability
