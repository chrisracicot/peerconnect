# PeerConnect – Learn Together, Grow Together

PeerConnect matches classmates who need academic help with peers ready to share their strengths. It provides a platform for college students to request help for specific courses and for others to offer their assistance. 

## Features

- **Unified Schema Setup:** Simplified database initialization with a single master `schema.sql` script handling all tables, RLS, and extensions.
- **Architectural Security (Auth Guard):** Professional-grade routing gate using Expo Router groups (`(auth)`) and global layout redirection to prevent unauthenticated access to protected screens.
- **Automated Escrow (pg_cron):** Hands-off fund release system using PostgreSQL background workers (`pg_cron`) to auto-release escrow sessions exactly after 21 days regardless of client activity.
- **Real-Time Messaging:** Instant 1-on-1 chat using Supabase PostgreSQL subscriptions for high-concurrency communication.
- **In-App Notifications:** Dedicated alerts system for tracking booking confirmations, payments, and message events.
- **Trust & Safety:** Integrated reporting pipeline for flagging content, manageable via a secure Admin Dashboard.
- **Admin Management:** Specialized dashboard (`admin@peerconnect.com`) for platform oversight, user management, and moderation.

## Tech Stack

The application is built using a modern full-stack mobile toolchain:

- **Frontend Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- **Backend/Database:** [Supabase](https://supabase.com/) for PostgreSQL DB, Authentication, Storage, and Row Level Security (RLS)
- **Styling:** React Native Stylesheets and custom components
- **Icons:** Expo vector icons (`FontAwesome`, `Feather`, etc.)

## Prerequisites

To run this project, make sure you have the following installed:
- Node.js (v18 or higher recommended)
- npm or yarn

You will also need a **Supabase project** to handle PostgreSQL, Auth, and Storage.

## Setup Instructions

1. **Clone the repository and install dependencies:**
   ```bash
   cd peerconnect-main
   npm install
   ```

2. **Set up Supabase:**
   - Create a new project on [Supabase.com](https://supabase.com/).
   - Go to your project's `SQL Editor` and run the contents of `schema.sql` to create all required tables, Row Level Security policies, and triggers.
   - Run `seed.sql` to populate initial mock data (optional).

3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`
   - Paste values from your Supabase project settings into the new `.env` file.

4. **Run the application:**
   - To install dependencies and start the Expo development server:
     ```bash
     npm install
     npx expo start
     ```
   - To run on Web:
     ```bash
     npm run web
     ```
   - To run on iOS / Android emulators:
     ```bash
     npm run ios
     # or
     npm run android
     ```

## Project Structure

- `/app`: Contains all screens and routing structure for Expo Router, divided mostly between `(tabs)` and standalone screens.
- `/components`: Reusable UI components (e.g., `Header`, `RequestCard`, etc.).
- `/constants`: Global constants like theme colors and layout definitions.
- `/context`: React Context providers (Auth, Form/Data).
- `/lib`: Helper services and configuration (e.g., Supabase client setup, API services).
- `schema.sql` / `seed.sql`: Database definitions for the Supabase backend.

## Authors & License

Contributors to PeerConnect. Built with React Native & Expo.
Christin Racicot, Karie Israeli, George Conde, Ruili Hu (Lily)
