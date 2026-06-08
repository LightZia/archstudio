# ArchStudio - Course Certificate Management System

A premium web application designed for AutoCAD and Architecture professors to manage course certificates with a luxury interior design firm aesthetic.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [How It Works](#how-it-works)
6. [Requirements](#requirements)
7. [Installation](#installation)
8. [Environment Variables](#environment-variables)
9. [Firebase Setup](#firebase-setup)
10. [Adding a 3D Model](#adding-a-3d-model)
11. [Deployment](#deployment)
12. [Security](#security)

---

## Overview

ArchStudio is a certificate management platform built for architectural design education. It provides three main interfaces:

- **Landing Page**: A sleek hero section showcasing the professor's achievements
- **Admin Dashboard**: Course and student management with certificate generation
- **Student Portal**: Verification and certificate download for enrolled students

The design follows a dark mode color palette with deep charcoal/slate backgrounds, crisp white typography, and elegant gold/bronze accents - inspired by high-end architectural firm websites.

---

## Features

### Landing Page
- Hero section with "Master Architectural Design" branding
- 3D model placeholder (ready for React Three Fiber or Spline integration)
- Professor achievements grid with statistics
- Student and Admin login access points

### Admin Dashboard
- Secure authentication with email and password
- Side navigation (Courses, Students, Templates)
- Course management with grid layout
- Create new courses with modal forms and drag-and-drop upload
- Student data table with:
  - Name and contact information
  - Course assignment
  - Completion toggle switches
  - Certificate status tracking

### Student Portal
- Phone number verification system
- Enrolled courses dashboard
- Download premium certificates for completed courses
- In-progress course tracking

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui + Radix UI |
| **Icons** | Lucide React |
| **Backend** | Firebase (Auth, Firestore, Storage) |
| **State Management** | React Hooks (useState, useEffect) |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Recharts |
| **Animations** | tw-animate-css |

### Core Dependencies

```json
{
  "next": "16.2.0",
  "react": "19.2.4",
  "typescript": "5.7.3",
  "tailwindcss": "^4.2.0",
  "firebase": "^12.12.0",
  "firebase-admin": "^13.8.0",
  "lucide-react": "^0.564.0"
}
```

---

## Project Structure

```
archstudio/
├── app/
│   ├── api/
│   │   └── admin/
│   │       └── login/
│   │           └── route.ts      # Admin login API endpoint
│   ├── globals.css               # Global styles & design tokens
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main page with view routing
│
├── components/
│   ├── admin-dashboard.tsx       # Admin panel with course/student management
│   ├── admin-login.tsx           # Admin authentication form
│   ├── landing-page.tsx          # Hero section and achievements
│   ├── navigation.tsx            # Top navigation bar
│   ├── student-portal.tsx        # Student verification and certificates
│   ├── theme-provider.tsx        # Dark/light theme support
│   └── ui/                       # shadcn/ui components (40+ components)
│
├── lib/
│   ├── firebase.ts               # Firebase client-side configuration
│   ├── firebase-admin.ts         # Firebase Admin SDK (server-side)
│   └── utils.ts                  # Utility functions (cn helper)
│
├── hooks/
│   ├── use-mobile.ts             # Mobile detection hook
│   └── use-toast.ts              # Toast notification hook
│
├── public/
│   └── models/                   # Place 3D models here (.glb, .gltf)
│
├── .env.example                  # Environment variables template
├── .env.local                    # Your local environment variables
├── service-account-key.example.json  # Firebase service account template
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Project dependencies
```

---

## How It Works

### Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Landing Page                            │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Student Login   │    │   Admin Access   │               │
│  └────────┬─────────┘    └────────┬─────────┘               │
└───────────┼───────────────────────┼─────────────────────────┘
            │                       │
            ▼                       ▼
┌───────────────────┐    ┌───────────────────────┐
│  Student Portal   │    │    Admin Login        │
│                   │    │  (Email + Password)   │
│  • Verify Phone   │    └───────────┬───────────┘
│  • View Courses   │                │
│  • Download Certs │                ▼
└───────────────────┘    ┌───────────────────────┐
                         │   Admin Dashboard     │
                         │                       │
                         │  • Manage Courses     │
                         │  • Manage Students    │
                         │  • Issue Certificates │
                         └───────────────────────┘
```

### Authentication Flow

1. **Admin clicks "Admin Access"** on landing page
2. **Login form appears** requesting email and password
3. **API route `/api/admin/login`** validates credentials against environment variables
4. **On success**, user is redirected to Admin Dashboard
5. **Logout button** in navigation clears authentication state

### Component Architecture

```
page.tsx (State Management)
    │
    ├── Navigation (View switching, logout)
    │
    ├── LandingPage
    │   ├── Hero Section
    │   ├── 3D Model Placeholder
    │   └── Achievements Grid
    │
    ├── AdminLogin
    │   └── Calls /api/admin/login
    │
    ├── AdminDashboard
    │   ├── Sidebar Navigation
    │   ├── Course Management
    │   │   ├── Course Grid
    │   │   └── Create Course Modal
    │   └── Student Management
    │       └── Student Table
    │
    └── StudentPortal
        ├── Phone Verification
        └── Course Dashboard
            └── Certificate Downloads
```

---

## Requirements

### System Requirements
- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager

### Firebase Requirements
- Firebase project with:
  - Authentication enabled
  - Firestore database
  - Storage bucket (for certificates/uploads)

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd archstudio
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install

# Using yarn
yarn install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your Firebase credentials
```

### 4. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Firebase Client-Side Configuration

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-your_measurement_id
```

### Admin Credentials

```env
ADMIN_EMAIL=demo@archstudio.com
ADMIN_PASSWORD=your_demo_password_here
```

### Firebase Admin SDK (Server-Side)

```env
FIREBASE_ADMIN_PROJECT_ID=your_project_id_here
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Follow the setup wizard

### 2. Get Client Configuration

1. In Firebase Console, click the gear icon > Project settings
2. Scroll to "Your apps" > Add a web app
3. Copy the configuration values to `.env.local`

### 3. Generate Service Account Key

1. Go to Project settings > Service accounts
2. Click "Generate new private key"
3. Save the file as `service-account-key.json` in the project root
4. **Important**: This file is already in `.gitignore` - never commit it!

### 4. Enable Firebase Services

- **Authentication**: Enable Email/Password sign-in method
- **Firestore**: Create a database in production mode
- **Storage**: Set up a storage bucket

---

## Adding a 3D Model

The landing page includes a placeholder for a 3D rotating building model.

### Steps to Add Your Model

1. **Place your model file** (`.glb` or `.gltf`) in `/public/models/`

2. **Install 3D libraries**:
   ```bash
   pnpm add @react-three/fiber @react-three/drei three
   pnpm add -D @types/three
   ```

3. **Create a 3D component** (example):
   ```tsx
   // components/building-model.tsx
   'use client'
   
   import { Canvas } from '@react-three/fiber'
   import { OrbitControls, useGLTF } from '@react-three/drei'
   
   function Building() {
     const { scene } = useGLTF('/models/your-building.glb')
     return <primitive object={scene} scale={1} />
   }
   
   export function BuildingModel() {
     return (
       <Canvas camera={{ position: [0, 0, 5] }}>
         <ambientLight intensity={0.5} />
         <directionalLight position={[10, 10, 5]} />
         <Building />
         <OrbitControls autoRotate />
       </Canvas>
     )
   }
   ```

4. **Replace the placeholder** in `components/landing-page.tsx`

### Supported Formats
- `.glb` (recommended)
- `.gltf`
- Spline scenes
- Any Three.js compatible format

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables in Vercel

Add all variables from `.env.local` to:
**Settings > Environment Variables**

**Important**: For `FIREBASE_ADMIN_PRIVATE_KEY`, paste the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`.

### Build Commands

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

---

## Security

### Best Practices Implemented

1. **Server-side credential validation**: Admin credentials are checked on the server via API route
2. **Environment variables**: All sensitive data stored in environment variables
3. **Firebase Admin SDK**: Server-side operations use service account credentials
4. **Gitignore protection**: Service account keys and .env files are excluded from version control

### Security Checklist

- [ ] Change default admin credentials in `.env.local`
- [ ] Use strong, unique passwords
- [ ] Enable Firebase Security Rules for Firestore
- [ ] Set up Firebase Storage security rules
- [ ] Enable HTTPS in production
- [ ] Implement rate limiting for login attempts
- [ ] Consider adding 2FA for admin access

### Files to Never Commit

```
.env.local
.env
service-account-key.json
*.pem
*.key
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

---

## Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | Deep charcoal | Page backgrounds |
| `--foreground` | Off-white | Primary text |
| `--primary` | Gold/Bronze | Accent buttons, highlights |
| `--secondary` | Dark slate | Secondary backgrounds |
| `--muted` | Gray | Subtle text, borders |

### Typography

- **Headings**: System sans-serif, semibold to bold
- **Body**: System sans-serif, regular weight
- **Monospace**: Used for code snippets

---

## License

This project is private and proprietary.

---

## Support

For issues or questions, contact the development team.

---

Built with Next.js 16, TypeScript, Tailwind CSS, and Firebase.