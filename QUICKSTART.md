# Quick Start Guide

Get your Meal Planner up and running in 5 minutes!

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Port 3000 available (or use a different port)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/meal-planner.git
cd meal-planner
```

### 2. Build the Docker Image

```bash
docker build -t meal-planner .
```

This will take 1-2 minutes on first build.

### 3. Run the Container

```bash
docker run -d \
  -p 3000:3000 \
  -v meal-planner-data:/app/data \
  -e ADMIN_PIN=my-secure-pin-123 \
  --name meal-planner \
  --restart unless-stopped \
  meal-planner
```

**⚠️ IMPORTANT:** Replace `my-secure-pin-123` with your own secure PIN!

### 4. Access the Application

Open your browser and go to:
- **Local access:** `http://localhost:3000`
- **Network access:** `http://[your-raspberry-pi-ip]:3000`

## First Steps

### 1. Plan Your Week

- Click on the **Week Planner** tab (should be open by default)
- Use the dropdown menus to select meals for each day
- Watch your shopping list generate automatically below!

### 2. View Your Recipes

- Click the **Recipes** tab
- See detailed instructions for all your planned meals
- Click **🖨️ Print Recipes** to print for your kitchen

### 3. Manage Your Meals (Admin)

- Click the **Manage Meals** tab
- Enter your admin PIN (the one you set with `ADMIN_PIN`)
- Add, edit, or delete meals from your collection

## Default Content

The app comes with 20 pre-loaded recipes to get you started!

## Customization

### Change the Port

To run on port 8080 instead of 3000:

```bash
docker run -d \
  -p 8080:3000 \
  -v meal-planner-data:/app/data \
  -e ADMIN_PIN=your-pin \
  --name meal-planner \
  --restart unless-stopped \
  meal-planner
```

### Change the Admin PIN Later

```bash
# Stop the container
docker stop meal-planner
docker rm meal-planner

# Run with new PIN
docker run -d \
  -p 3000:3000 \
  -v meal-planner-data:/app/data \
  -e ADMIN_PIN=new-pin-456 \
  --name meal-planner \
  --restart unless-stopped \
  meal-planner
```

Your data is preserved in the Docker volume!

## Troubleshooting

### Can't Access the App?

1. Check the container is running:
   ```bash
   docker ps
   ```

2. Check the logs:
   ```bash
   docker logs meal-planner
   ```

3. Make sure port 3000 is not in use:
   ```bash
   # Linux/Mac
   sudo lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

### Port Already in Use?

Use a different port:
```bash
docker run -d -p 8080:3000 ...
```

### Container Won't Start?

Check the logs:
```bash
docker logs meal-planner
```

### Need to Reset Everything?

```bash
# Stop and remove container
docker stop meal-planner
docker rm meal-planner

# Remove data volume (⚠️ This deletes all your meals and plans!)
docker volume rm meal-planner-data

# Start fresh
docker run -d -p 3000:3000 -v meal-planner-data:/app/data -e ADMIN_PIN=your-pin --name meal-planner meal-planner
```

## Next Steps

- Read the full [README.md](README.md) for advanced features
- Check out [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute
- Set up a [Cloudflare Tunnel](README.md#-cloudflare-tunnel-setup) for remote access

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Open an issue on GitHub
- Review existing issues for solutions

---

**Happy meal planning! 🍽️**