# PLTD Tahuna Maintenance App

Aplikasi manajemen pemeliharaan pembangkit listrik PLTD Tahuna.

## Tech Stack

- **Framework**: Nuxt.js 3
- **Styling**: Custom CSS Design System
- **Database**: MySQL/MariaDB
- **Authentication**: Google OAuth 2.0

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_MAIN_NAME=maintenance
DB_AUTH_NAME=auth

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
```

## Features

- Dashboard pemeliharaan dengan status real-time
- Jadwal Preventive Maintenance (PM) otomatis
- Calendar view untuk jadwal PM
- Material planning
- Google OAuth authentication
