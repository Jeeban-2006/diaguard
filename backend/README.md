# DiaguARd Backend

Express.js backend API for DiaguARd health monitoring system.

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
# Start development server with auto-reload
npm run dev
# or
pnpm dev
```

The server will be available at `http://localhost:3000`

### Production

```bash
# Start production server
npm start
# or
pnpm start
```

## Project Structure

```
src/
├── index.js                    # Main application entry point
├── routes/                     # API routes (to be added)
├── controllers/                # Request handlers (to be added)
├── models/                     # Data models (to be added)
├── middleware/                 # Custom middleware (to be added)
└── utils/                      # Utility functions (to be added)
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Check server status

### Health Data
- **POST** `/api/health-data` - Submit health data

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
NODE_ENV=development
```

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- Authentication & Authorization
- Data validation
- Logging system
- Health data processing algorithms
- WebSocket support for real-time updates
