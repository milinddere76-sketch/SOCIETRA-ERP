# Production Deployment Guide - SOCIETRA

This guide covers the deployment of the SOCIETRA ERP platform.

## 1. Prerequisites
- Docker & Docker Compose
- Domain Name with SSL (Certbot/Cloudflare)
- SMTP Server (for emails)
- Razorpay API Keys
- WhatsApp Business API (Interakt / Wati)

## 2. Infrastructure Setup (Docker)
Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: society_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      spring.datasource.url: jdbc:postgresql://db:5432/society_db
      spring.datasource.username: admin
      spring.datasource.password: password123
      chs.app.jwtSecret: ${JWT_SECRET}
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## 3. Database Migration
The application uses Hibernate ddl-auto for development, but for production, use **Flyway** or **Liquibase**.
1. Primary schema is located in `docs/schema_full.sql`.
2. Run migrations before starting the containers.

## 4. Environment Variables
Ensure the following are set in your production environment:
- `JWT_SECRET`: Random 256-bit string.
- `RAZORPAY_KEY_ID`: Your live key.
- `RAZORPAY_KEY_SECRET`: Your live secret.
- `SPRING_MAIL_PASSWORD`: SMTP password.

## 5. Mobile Version (Capacitor)
To convert the web app to a mobile app:
1. `npm install @capacitor/core @capacitor/cli`
2. `npx cap init Societra com.chs.app`
3. `npm run build`
4. `npx cap add android`
5. `npx cap open android`

## 6. Monitoring
- Use **Spring Boot Actuator** for health checks.
- Setup **Prometheus & Grafana** for dashboard analytics.
