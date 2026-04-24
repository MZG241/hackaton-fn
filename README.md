# Akazi Nexus - AI Recruitment Frontend (Nexus UI)

A premium, glassmorphism-inspired recruitment interface built for the next generation of talent acquisition. Akazi Nexus provides a seamless, AI-integrated experience for both candidates and employers.

## ✨ Premium Experience
- **Visual Language**: High-end Glassmorphism, deep gradients, and fluid animations.
- **AI-First UX**: Integrated AI dashboards, real-time CV parsing confirmation, and interactive AI coaching.
- **Responsive Core**: Engineered for high-stakes operation on any device.

## 🚀 Technology Stack
- **Framework**: Next.js 15 (App Router & Turbopack)
- **Styling**: Vanilla CSS with modern Glassmorphism tokens
- **Animations**: Framer Motion
- **State Management**: Redux Toolkit (Session & Auth sync)
- **Networking**: Axios with centralized interceptors
- **Icons**: Lucide React & Custom Neural Icon Set

## 🛰️ Architecture & User Flows

### 👤 Candidate Flow
1. **Node Entry**: Register/Login as a Jobseeker.
2. **Intelligence Sync**: Upload CV -> AI extracts skills and experience -> User confirms and syncs profile.
3. **Mission Search**: Browse high-stakes opportunities with AI-predicted match scores.
4. **Guidance**: Chat with the AI Career Coach for profile optimization and interview prep.

### 🏢 Employer Flow
1. **Mission Deployment**: Input a job idea -> AI generates 3 comprehensive listing proposals -> Customize and Publish.
2. **AI Dashboard**: View a "Bento-style" overview of all candidates.
3. **Neural Analysis**: Deep-dive into AI screening results (Strengths, Gaps, Risks, and Match Scores).
4. **Decision Engine**: Side-by-side candidate comparison and quick Hire/Reject synchronization.

## 🛠️ Setup & Environment
1. **Clone & Install**: `npm install`
2. **Environment**: Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
3. **Run**: `npm run dev`

## 📂 Key Routing
- `/` - Strategic Entry Landing
- `/employer-dashboard` - Global operation control for recruiters
- `/candidate-dashboard` - Career mission tracking for jobseekers
- `/admin-dashboard` - Platform governance panel
- `/employer/ai-dashboard/[jobId]` - Advanced AI analysis hub for specific missions
- `/post-job` - AI-assisted mission parameter definition

## 🛡️ Governance & Middleware
The frontend utilizes a `ProtectedRoute` system to ensure that only authorized nodes (Employer, Jobseeker, Admin) can access specific dashboard parameters.

---
*Akazi Nexus: Where Intelligence Meets Opportunity.*
