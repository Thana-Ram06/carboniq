# CarbonIQ — AI Agricultural Carbon Intelligence Platform

> **AI-powered satellite carbon intelligence for India's agricultural sector**

CarbonIQ is a production-ready climate-tech SaaS platform that helps farmers, agri-tech companies, and carbon project developers monitor crops via satellite data, estimate carbon sequestration potential, and prepare verification-ready data for future carbon credit workflows.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Auth | Firebase Authentication |
| Database | Firestore |
| Maps | Leaflet + react-leaflet |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Theme | next-themes |
| Forms | react-hook-form + Zod |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/login/             # Authentication page
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── layout.tsx            # Dashboard layout (sidebar + header)
│   │   ├── dashboard/            # Main dashboard
│   │   ├── farms/                # Farm management
│   │   ├── farms/[id]/           # Farm detail page
│   │   ├── satellite/            # Satellite analytics
│   │   ├── carbon/               # Carbon estimation
│   │   ├── reports/              # Reports
│   │   └── settings/             # Settings
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles + CSS vars
├── components/
│   ├── ui/                       # Reusable UI primitives
│   ├── landing/                  # Landing page sections
│   ├── dashboard/                # Dashboard components
│   └── maps/                    # Leaflet map components
├── lib/
│   ├── firebase.ts               # Firebase initialization
│   ├── auth.ts                   # Auth functions
│   ├── firestore.ts              # Firestore CRUD
│   ├── carbon-estimation.ts      # Carbon calculation engine
│   └── utils.ts                  # Utilities
├── types/index.ts                # TypeScript types
├── hooks/                        # Custom React hooks
└── contexts/                     # React contexts
```

---

## Quick Start (Local Development)

### 1. Clone and install

```bash
git clone <repo-url>
cd carboniq
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Firebase credentials in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Firebase Setup (Step-by-Step)

### Step 1: Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → Name it `carboniq`
3. Enable Google Analytics (optional)
4. Click **Create project**

### Step 2: Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Enable **Google** provider:
   - Click Google → Enable → Add your support email → Save
3. Enable **Email/Password** provider:
   - Click Email/Password → Enable → Save

### Step 3: Create Firestore Database

1. **Firestore Database** → **Create database**
2. Select **Production mode** → Choose region (e.g., `asia-south1` for India)
3. Click **Enable**

### Step 4: Set Firestore Security Rules

Go to **Firestore** → **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /farms/{farmId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    match /carbon_estimations/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    match /satellite_analytics/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /reports/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /activity/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Step 5: Get Firebase Config

1. **Project settings** (gear icon) → **General** → **Your apps**
2. Click **</>** (Web app) → Register app
3. Copy the `firebaseConfig` object values to your `.env.local`

### Step 6: Enable Authorized Domains

1. **Authentication** → **Settings** → **Authorized domains**
2. Add your Vercel deployment domain (e.g., `carboniq.vercel.app`)

---

## Deploy on Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option B: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Add all environment variables from `.env.example`
5. Click **Deploy**

### Environment Variables on Vercel

In Vercel dashboard → **Settings** → **Environment Variables**, add all variables from `.env.example`.

---

## Architecture Notes

### Carbon Estimation Engine

The estimation uses IPCC Tier 1 methodology adapted for Indian agriculture:
- **Biomass carbon**: NDVI × Crop factor × Area × NDVI-to-biomass multiplier
- **Soil carbon**: SOC × efficiency × area × seasonal cycles
- **Reduced emissions**: Based on irrigation efficiency and vegetation coverage
- **CO₂e conversion**: Carbon × 3.67 (molecular weight ratio)

### Google Earth Engine Integration (Roadmap)

The platform is architecturally ready for GEE integration:
- `src/lib/gee.ts` will provide the GEE client wrapper
- `src/app/(dashboard)/satellite/page.tsx` has the viewer scaffold
- Replace mock NDVI data with real GEE `ee.Image` computations

### Map System

Leaflet with OpenStreetMap tiles. For premium satellite tiles, add Mapbox token and update the tile URL in `farm-map.tsx`.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT © 2025 CarbonIQ
