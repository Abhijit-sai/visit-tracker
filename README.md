# VisitTracker

VisitTracker is a modern, secure, and efficient visitor management system designed for organizations to track and manage visitors across multiple branches. It features a dual-interface system: a robust **Admin Dashboard** for management and a user-friendly **Kiosk Interface** for visitor self-registration.

## Features

### 🏢 Admin Dashboard
- **Visit Management**: View, approve, or decline visits in real-time.
- **Filtering & Search**: Filter visits by date range, branch, or search by visitor name.
- **Employee Management**: Manage employee records and roles.
- **Configuration**: Customize visit fields, approval rules, and more.
- **Role-Based Access**: Secure access for Administrators.

### 📱 Kiosk Interface (Visitor Facing)
- **Self-Registration**: Visitors can easily register their visit.
- **Scheduled Visits**: Fast check-in for pre-approved or scheduled visitors.
- **Photo Capture**: Capture visitor photos during registration.
- **Host Selection**: Select hosts from the employee directory.
- **Secure Access**: Restricted "Service Role" access prevents visitors from accessing admin features.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Abhijit-sai/visit-tracker.git
    cd visit-tracker
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Open the app**:
    - Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin)
    - Kiosk Portal: [http://localhost:3000/visit](http://localhost:3000/visit)

## Deployment

The application is optimized for deployment on [Vercel](https://vercel.com).

1.  Push your code to a Git repository.
2.  Import the project into Vercel.
3.  Add the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4.  Deploy.

### Custom Domain
To configure the custom subdomain `visittracker.madsoul.in`:
1.  Go to Vercel Project Settings > Domains.
2.  Add `visittracker.madsoul.in`.
3.  Add the CNAME record provided by Vercel to your DNS provider.

## Security

- **RBAC**: Strict separation between `ADMIN` and `KIOSK` roles.
- **Middleware**: Protected routes ensure unauthorized access is blocked.
- **Redirect Traps**: Kiosk users attempting to access Admin areas are safely redirected to sign out.

## License

Private Property of MadSoul.
