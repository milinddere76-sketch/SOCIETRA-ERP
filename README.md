# SOCIETRA ERP 🏢

SOCIETRA is a modern, high-performance ERP system designed specifically for **Cooperative Housing Societies**. It streamlines society management, billing, security, and member communications with a glassmorphism-inspired aesthetic and AI-driven insights.

## ✨ Core Features
- **📊 Real-time Dashboard**: Financial health, visitor stats, and pending dues at a glance.
- **💰 Automated Billing**: One-click maintenance bill generation and payment tracking.
- **🛡️ Security Hub**: Real-time visitor logs and security personnel management.
- **📉 AI Intelligence**: Predictive analysis for recovery of dues and default risk assessment.
- **📄 Share Certificates**: Digital issuance and management of society share certificates.
- **💬 Community**: Automated WhatsApp notifications for bills and OTP verification.

## 🛠️ Technology Stack
- **Backend**: Spring Boot 3, Java 17, PostgreSQL, JPA/Hibernate.
- **Frontend**: React 18, Vite, Framer Motion, Tailwind CSS, Lucide Icons.
- **Infrastructure**: Docker, Docker Compose, GitHub Actions (CI/CD), Nginx.

## 🚀 Quick Start (Development)
1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/[YOUR_USERNAME]/societra-erp.git
    cd societra-erp
    ```
2.  **Run with Docker**:
    ```bash
    docker-compose up --build
    ```
3.  **Access**:
    - Frontend: `http://localhost`
    - Backend API: `http://localhost:8080`

## 🛡️ Production Deployment
Refer to the [PROD_DEPLOYMENT.md](./PROD_DEPLOYMENT.md) for instructions on setting up environment variables, SSL/HTTPS, and CI/CD pipelines.

## 🧪 Testing State
For detailed test results and current system state, see [TEST_RESULTS.md](./TEST_RESULTS.md).

---
Built with ❤️ for better society management.
