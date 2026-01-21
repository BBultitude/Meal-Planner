# 🍽️ Meal Planner

A self-hosted web application for planning weekly meals, generating smart shopping lists, and managing recipes. Built with Node.js and vanilla JavaScript, designed to run in a Docker container on a Raspberry Pi or any other server.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 📅 **Weekly Meal Planning** - Plan meals for each day of the week with an intuitive interface
- 🛒 **Smart Shopping List** - Automatically consolidates ingredients across meals with quantity calculations
- 📏 **Australian Measurements** - Converts cups, tablespoons, and teaspoons to grams for easy shopping
- 📖 **Recipe Management** - View detailed cooking instructions with ingredients per meal
- 🖨️ **Printable Recipes** - Print your weekly meal plan for the kitchen
- 🔒 **PIN-Protected Admin** - Secure admin panel for adding, editing, and deleting meals
- 💾 **Persistent Storage** - All data stored in Docker volumes, survives container restarts
- 🌐 **Self-Hosted** - Run on your own server, Raspberry Pi, or any Docker-compatible system
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- Docker installed on your system
- Port 3000 available (or change to any free port)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/meal-planner.git
   cd meal-planner
   ```

2. **Build the Docker image**
   ```bash
   docker build -t meal-planner .
   ```

3. **Run the container**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -v meal-planner-data:/app/data \
     -e ADMIN_PIN=your-secure-pin \
     --name meal-planner \
     --restart unless-stopped \
     meal-planner
   ```

   **⚠️ Important:** Replace `your-secure-pin` with your own secure PIN.

4. **Access the application**
   - Local: `http://localhost:3000`
   - Network: `http://[your-server-ip]:3000`

## 📋 Default Meals

The application comes pre-loaded with 20 recipes to get you started. You can add, edit, or delete these via the admin panel.

- Chicken Fried Rice
- Honey Soy Chicken
- Pork Schnitzel with Mash
- Beef Stroganoff
- Chicken Quesadillas
- Salmon and Veg
- Pork San Choy Bow
- Chicken & Mushroom Risotto
- Beef Stir-Fry
- Chicken Pesto Pasta
- Pork Sausage Pasta
- Lemon Garlic Chicken
- Chicken Teriyaki Stir-Fry
- Beef & Potato Hash
- Mushroom Omelette
- Creamy Chicken Pasta
- Beef and Veg Bolognese
- Salmon Rice Bowls
- Pork and Veg Stir-Fry
- Bacon and Zucchini Frittata

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_PIN` | PIN for accessing the admin panel | `1234` |
| `PORT` | Port the server runs on | `3000` |

### Changing the Admin PIN

**Method 1: Environment Variable (Recommended)**
```bash
docker run -d \
  -p 3000:3000 \
  -v meal-planner-data:/app/data \
  -e ADMIN_PIN=my-new-pin-9876 \
  --name meal-planner \
  --restart unless-stopped \
  meal-planner
```

**Method 2: Edit server.js**
```javascript
const ADMIN_PIN = process.env.ADMIN_PIN || 'your-default-pin';
```

### Using a Different Port

```bash
docker run -d \
  -p 8080:3000 \
  -v meal-planner-data:/app/data \
  -e ADMIN_PIN=your-pin \
  --name meal-planner \
  --restart unless-stopped \
  meal-planner
```

Access at `http://localhost:8080`

## 🎯 Usage

### Planning Your Week

1. Navigate to the **Week Planner** tab
2. Select a meal for each day from the dropdown menus
3. Your shopping list automatically generates below

### Viewing Recipes

1. Go to the **Recipes** tab
2. See detailed instructions for each meal you've planned
3. Click **🖨️ Print Recipes** to print your weekly meal plan

### Managing Meals (Admin)

1. Go to the **Manage Meals** tab
2. Enter your admin PIN (default: `1234`)
3. Add new meals, edit existing ones, or delete meals you don't want

## 📊 Shopping List Features

The shopping list intelligently:
- **Consolidates quantities**: "1 medium carrot" + "1 medium carrot" = "2 medium carrots"
- **Converts measurements**: "2 cups peas" shows as "2 cups (500g)"
- **Handles pantry staples**: Salt, pepper, and olive oil show as "As needed"
- **Supports various units**: Cups, tablespoons, teaspoons, grams, and counts

## 🐳 Docker Commands

### View Logs
```bash
docker logs -f meal-planner
```

### Stop Container
```bash
docker stop meal-planner
```

### Start Container
```bash
docker start meal-planner
```

### Restart Container
```bash
docker restart meal-planner
```

### Remove Container (keeps data)
```bash
docker stop meal-planner
docker rm meal-planner
```

### Remove Everything (including data)
```bash
docker stop meal-planner
docker rm meal-planner
docker volume rm meal-planner-data
```

### Update the Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker stop meal-planner
docker rm meal-planner
docker build -t meal-planner .
docker run -d \
  -p 3000:3000 \
  -v meal-planner-data:/app/data \
  -e ADMIN_PIN=your-pin \
  --name meal-planner \
  --restart unless-stopped \
  meal-planner
```

## 💾 Backup and Restore

### Backup Your Data
```bash
docker run --rm \
  -v meal-planner-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/meal-planner-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore from Backup
```bash
docker run --rm \
  -v meal-planner-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/meal-planner-backup-YYYYMMDD.tar.gz -C /data
```

## 🌐 Cloudflare Tunnel Setup

To access your meal planner from anywhere:

1. Install Cloudflare Tunnel:
   ```bash
   curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
   chmod +x cloudflared
   ```

2. Authenticate:
   ```bash
   ./cloudflared tunnel login
   ```

3. Create a tunnel:
   ```bash
   ./cloudflared tunnel create meal-planner
   ```

4. Configure the tunnel (create `config.yml`):
   ```yaml
   tunnel: <tunnel-id>
   credentials-file: /path/to/credentials.json
   
   ingress:
     - hostname: meals.yourdomain.com
       service: http://localhost:3000
     - service: http_status:404
   ```

5. Run the tunnel:
   ```bash
   ./cloudflared tunnel run meal-planner
   ```

## 🏗️ Project Structure

```
meal-planner/
├── Dockerfile           # Docker container configuration
├── package.json         # Node.js dependencies
├── server.js           # Backend API server
├── index.html          # Frontend application
├── README.md           # This file
└── data/               # Created by Docker volume
    └── meals.json      # Persistent data storage
```

## 🛠️ Development

### Local Development (without Docker)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the server:
   ```bash
   ADMIN_PIN=1234 node server.js
   ```

3. Access at `http://localhost:3000`

### Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: JSON file-based storage
- **Container**: Docker with Alpine Linux

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/YOUR-USERNAME/meal-planner/issues).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for simple, self-hosted meal planning
- Designed to run efficiently on Raspberry Pi and other low-power devices
- Created to solve the "what's for dinner?" problem

## 💾 Disaster Recovery

If your Raspberry Pi fails or you need to rebuild:

1. **Your data is safe** - As long as you have the Docker volume backed up
2. **Backup regularly:**
   ```bash
   docker run --rm \
     -v meal-planner-data:/data \
     -v $(pwd):/backup \
     alpine tar czf /backup/meal-planner-backup-$(date +%Y%m%d).tar.gz -C /data .
   ```
3. **Restore on new system:**
   ```bash
   # Pull the code
   git clone https://github.com/YOUR-USERNAME/meal-planner.git
   cd meal-planner
   
   # Build and create volume
   docker build -t meal-planner .
   docker volume create meal-planner-data
   
   # Restore your backup
   docker run --rm \
     -v meal-planner-data:/data \
     -v $(pwd):/backup \
     alpine tar xzf /backup/meal-planner-backup-YYYYMMDD.tar.gz -C /data
   
   # Start the container
   docker run -d -p 3000:3000 -v meal-planner-data:/app/data -e ADMIN_PIN=your-pin --name meal-planner --restart unless-stopped meal-planner
   ```

## 📞 Support

If you encounter any issues:
- Check the [issues page](https://github.com/YOUR-USERNAME/meal-planner/issues)
- Review the logs: `docker logs meal-planner`
- Create a new issue with details about your problem

---

**Made for easy meal planning and disaster recovery** 🍽️💾