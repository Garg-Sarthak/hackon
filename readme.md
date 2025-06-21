# HackOn Watch Party Platform

A full-stack, real-time watch party platform with personalized recommendations, analytics, and multi-user chat. Built with Node.js, React, Kafka, Redis, Supabase, and InfluxDB.

---

## Features

- **Watch Parties:** Synchronized video playback and chat for groups.
- **Personalized Recommendations:** AI-powered movie/TV suggestions based on user history and preferences.
- **Voice Search:** Natural language search for movies and shows.
- **Analytics:** Real-time event tracking with Kafka and InfluxDB.
- **Multi-platform:** Modern React frontend optimized for Fire TV and web.

---

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) (for Kafka, Zookeeper, and dependencies)
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- [Redis](https://redis.io/) (if not running via Docker)
- [Supabase](https://supabase.com/) project (for authentication and database)
- [InfluxDB](https://www.influxdata.com/) account (for analytics)
- API keys for [TMDB](https://www.themoviedb.org/) and [Google Gemini](https://aistudio.google.com/app/apikey)

---

## Setup Instructions

### 1. Start Docker Daemon

Make sure Docker Desktop or your Docker service is running.

---

### 2. Clone the Repository

```sh
git clone https://github.com/garg-Sarthak/hackon
cd hackon
```

---

### 3. Install Root Dependencies

```sh
npm install
```

---

### 4. Set Up Kafka and Zookeeper (OPTIONAL : Only if want analytics)

```sh
cd kafka_setup
docker compose up -d
cd ..
```

This will start Kafka and Zookeeper containers in the background.

---

### 5. Configure Environment Variables

- Copy `.env.example` to `.env` in each relevant directory (`/hackon`, `/hackon/backend`, `/hackon/frontend/fire-tv-app`).
- Fill in your Supabase, TMDB, Google Gemini, Redis, and InfluxDB credentials.

---

### 6. Backend Setup

```sh
cd backend
npm install
```

- Start the main backend server:
  ```sh
  nodemon server.js
  ```
- Start the analytics service: (Optional : Don't use without starting kafka)
  ```sh
  nodemon analytics.js
  ```

---

### 7. Frontend Setup

```sh
cd ../frontend/fire-tv-app
npm install
npm run dev
```

- The app will be available at [http://localhost:5173](http://localhost:5173) by default.

---

## Directory Structure

```
hackon/
  backend/         # Node.js API, WebSocket, analytics
  frontend/
    fire-tv-app/   # React frontend (Vite)
  kafka_setup/     # Kafka & Zookeeper Docker Compose
  .env             # Root environment config
```

---

## Useful Commands

- **Stop Kafka stack:**  
  `cd kafka_setup && docker compose down`
- **View logs:**  
  Use `docker logs <container>` or check the terminal output for backend/frontend.

---

## Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.

---

## License

MIT License

---

## Troubleshooting

- Ensure all environment variables are set correctly.
- Kafka, Redis, and InfluxDB must be running for analytics and real-time features.
- If ports are in use, adjust them in the respective config files.

---

## Credits

- [TMDB](https://www.themoviedb.org/) for movie data
- [Supabase](https://supabase.com/) for authentication and database
- [Google Gemini](https://aistudio.google.com/) for AI recommendations

---

Enjoy your watch party experience!
