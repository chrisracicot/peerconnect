# PeerConnect – Learn Together, Grow Together

PeerConnect matches classmates who need academic help with peers ready to share their strengths. It provides a platform for college students to request help for specific courses and for others to offer their assistance. 

## Features

- **Authentication:** Secure email and password signup/login flow.
- **Request Management:** Post requests for help in specific courses (e.g., math, computer science) and browse requests made by others.
- **Bookings & Proposals:** Tutors can propose tutoring sessions with set prices directly in chat.
- **Secure Mock Payments (Escrow):** Students can accept proposals and process mock payments that are securely held in escrow until the session is completed.
- **Direct Messaging:** Chat securely in real-time with classmates to coordinate help.
- **Trust & Safety:** In-app reporting system allows users to flag inappropriate messages or users for admin review.
- **Profiles:** Manage your user profile safely.
- **Admin Dashboard:** Special demo admin view (`admin@peerconnect.com`) for tracking and managing users, posts, and moderation reports on the platform.

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
   Create a `.env` file in the root of the project:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Replace `your_supabase_project_url` and `your_supabase_anon_key` with the credentials from your Supabase dashboard.*

4. **Run the application:**
   - To start the Expo development server:
     ```bash
     npm start
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
Christin Racicot, Kareem Isreali, George Conde, Ruili Hu (Lily)
