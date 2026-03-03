# SOCIETRA Production Deployment Guide

This guide describes how to deploy the SOCIETRA ERP system in a production environment using Docker.

## 1. Prerequisites
- Docker and Docker Compose installed
- A domain name (optional, for SSL)
- SMTP credentials for emails
- Razorpay API keys
- Interakt/WhatsApp API keys

## 2. Configuration
1.  **Environment Variables**: Copy `.env.example` to `.env`.
    ```bash
    cp .env.example .env
    ```
2.  **Edit `.env`**: Fill in your production secrets. **Do not use default passwords.**
    - `POSTGRES_PASSWORD`: Use a strong random string.
    - `JWT_SECRET`: Use a 64+ char random string.
    - `RAZORPAY_KEY_*`: Use your Live keys for real payments.

## 3. Deployment
Run the production compose file:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env up --build -d
```

## 4. Maintenance
- **Logs**: Backend logs are persisted in `./backend/logs`.
- **Database**: Postgres data is stored in the `postgres_data_prod` Docker volume.
- **Updates**: To update the app, pull the latest code and rerun the deployment command.

## 5. CI/CD Pipeline
The project includes a GitHub Actions workflow in `.github/workflows/ci-cd.yml`.
1.  **Secrets**: Add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` to your GitHub repository secrets.
2.  **Trigger**: On every push to `main`, it will build the backend, frontend, and push images to Docker Hub.

## 6. SSL/TLS Setup (HTTPS)
For production, you **must** use HTTPS.

### Option A: Nginx Proxy Manager (Included in Compose)
I have added Nginx Proxy Manager (NPM) to the production stack. It provides a simple web interface to manage SSL.

1. **Deploy the stack**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```
2. **Access the Admin UI**:
   Open `http://your-server-ip:81`
   - **Default Login**: `admin@example.com`
   - **Default Password**: `changeme`
   *(You will be asked to change these on first login)*

3. **Add a Proxy Host**:
   - Go to **Hosts** -> **Proxy Hosts** -> **Add Proxy Host**.
   - **Domain Names**: Enter your domain (e.g., `society.yourdomain.com`).
   - **Scheme**: `http`
   - **Forward Name/IP**: `societra-frontend-prod`
   - **Forward Port**: `80`
   - **Block Common Exploits**: Enable.
   - **Websockets Support**: Enable (for future-proofing).

4. **Add SSL**:
   - Click the **SSL** tab in the same window.
   - Select **Request a new SSL Certificate**.
   - Enable **Force SSL** and **HTTP/2 Support**.
   - Agree to Let's Encrypt TOS and click **Save**.

Your site is now live at `https://society.yourdomain.com`!

## 7. Security Recommendations
- **SSL/TLS**: Always use HTTP redirection to HTTPS.
- **Firewall**: Ensure port `8080` (backend) and `5432` (db) are not accessible from the public internet.
- **Backups**: Implement a script to dump the Postgres database daily.
    ```bash
    docker exec societra-db-prod pg_dump -U chs_admin chs_society > backup_$(date +%F).sql
    ```
