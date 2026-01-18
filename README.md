# NSWG1 Website

**NSWG1-website** is a full-stack [Next.js](https://nextjs.org) application designed to serve as both a recruitment platform and an internal management tool for the Naval Special Warfare Group One community. It showcases the group's activities, facilitates recruitment, and provides robust tools for attendance tracking, member management, and real-time communication.

## Project Showcase

- **Use Cases**
  - Recruitment hub showcasing the group's activities and facilitating new member onboarding via Discord OAuth2 (NextAuth.js)
  - Role-based access control with an admin dashboard for managing members and their data
  - Real-time ticketing system for support requests related to the website, game server, or other game-related issues
  - Live chat system for support and team communication, keeping members updated with real-time data
  - Attendance tracking, join forms, galleries, and integration with Perscom API for personnel management

- **Tech Stack**
  - Next.js App Router, React, TypeScript
  - Authentication: NextAuth.js (Discord provider)
  - Database: MySQL (via Prisma ORM)
  - Real-time: WebSockets (Socket.io)
  - Styling: Tailwind CSS, custom theming components

- **Architecture & Organization**
  - Modular `components/` and `src/app/` directory structure
  - Dedicated `database/` layer for migrations and data access
  - Serverless API routes under `src/app/api/`
  - Environment-driven configuration (`.env.local`)

- **Highlights**
  - End-to-end full-stack application
  - Secure OAuth2 workflows and session management
  - Scalable real-time features and microservices-style APIs
  - CI/CD-ready deployment pipeline

## Key Features

- OAuth2 login via Discord
- Role-based access control with admin dashboard
- Join forms, attendance tracking, galleries, Perscom API integration
- Planned: Integrated ticketing system with live chat powered by WebSockets

## Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/your-org/nswg1-website.git
   cd nswg1-website
   ```
2. Install dependencies:
   ```bash
   npm install
   # or yarn install
   ```
3. Copy `.env.local.example` to `.env.local` and add your environment variables:
   ```env
   DISCORD_CLIENT_ID=...
   DISCORD_CLIENT_SECRET=...
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
