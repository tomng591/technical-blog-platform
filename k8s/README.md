# Kubernetes Deployment Guide

## Prerequisites

1. DigitalOcean account with Kubernetes cluster
2. `doctl` CLI installed and configured
3. Docker installed locally
4. `kubectl` configured for your cluster

## Build and Push Docker Image

```bash
# Build the image
docker build -t technical-blog:latest .

# Login to DigitalOcean Container Registry
doctl registry login

# Tag the image
docker tag technical-blog:latest registry.digitalocean.com/your-registry/technical-blog:latest

# Push to registry
docker push registry.digitalocean.com/your-registry/technical-blog:latest
```

## Deploy to Kubernetes

```bash
# Generate registry credentials
doctl registry kubernetes-manifest | kubectl apply -f -

# Patch service account
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "registry-your-registry-name"}]}'

# Apply deployment
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get pods
kubectl get services

# Get LoadBalancer IP
kubectl get service technical-blog-service
```

## Update Deployment

```bash
# After building and pushing new image
kubectl rollout restart deployment/technical-blog

# Check rollout status
kubectl rollout status deployment/technical-blog
```

## Troubleshooting

```bash
# View logs
kubectl logs -l app=technical-blog --tail=100 -f

# Describe pod
kubectl describe pod -l app=technical-blog

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp
```