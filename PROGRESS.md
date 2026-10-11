# TERRA AeroHealth & Citizen Action — Implementation Progress

Track: **Air & Atmospheric Environmental Intelligence**  
Mission: **See it. Personalize it. Act on it.**

---

## 📌 Executive Architecture & Stack Overview

- **Spatial Visual Engine**: 3D Digital Twin with Mapbox GL JS Globe and 3D elevation terrain, synchronized Three.js micro-climate visualization, real Open-Meteo & Copernicus CAMS reanalysis.
- **AI Biological Age Engine**: High-tech clinical diagnostic engine powered by `@google/genai` (Gemini 3.8 Flash), calculating organ-specific premature wear (Lungs, Heart, Skin, Brain), life expectancy hours lost per month, and cellular pathology based on ambient AQI, PM2.5, and PM10 telemetry.
- **Citizen Ground Truth Flagging**: Georeferenced community reporting system for severe pollution sources (stubble burning, factory smoke, vehicle smog, open waste burning) with GPS auto-acquisition and direct photo evidence upload via AWS S3 Pre-Signed URLs and DynamoDB persistence.
- **AWS Serverless "Ship It" Free Tier Stack**:
  - **Hosting**: AWS Amplify (Automated CI/CD from GitHub configured via `amplify.yml`)
  - **Auth**: AWS Cognito (User Pools with JWT session authentication for citizen identity)
  - **Database**: Amazon DynamoDB (`TerraReports` & `TerraPosts` tables with spatial indexing)
  - **Storage**: Amazon S3 (`terra-evidence-storage` with 15-minute Pre-Signed URL direct client uploads)
  - **Compute/API**: AWS Lambda & API Gateway (Serverless functions) + Node/Express dual-mode runtime

---

## 🚀 The Core Loop Status

| Stage | Feature | Status | Implementation Details |
|---|---|---|---|
| **1. See It** | Mapbox 3D Globe & City View with live AQI | ✅ Complete | Continuous lattice interpolation, terrain DEM, 7-layer environmental controller. |
| **1. See It** | Central **TERRA Toggle**: `[ 🌍 Map Intelligence ]` vs `[ 👥 Community Action ]` | ✅ Complete | Smooth transition switch in top nav; dims the 3D globe when viewing community actions and auto-filters by the selected city. |
| **2. Personalize It** | **Biological Age Engine** (Sliding High-Tech Medical Dashboard) | ✅ Complete | Sliding clinical panel with biometric organ rings (Lungs, Heart, Skin, Brain), life expectancy lost counter (-X hrs/month), and interactive user age & exposure sliders. |
| **2. Personalize It** | **Gemini AI Disease Hazard Diagnostics** (`/api/gemini/biological-age`) | ✅ Complete | Dynamic toxicological pathology synthesis (alveolar macrophage breakdown, endothelial dysfunction) and clinical preventative protocols using Gemini 3.8 Flash. |
| **3. Act On It** | **Citizen Ground Truth** Pollution Report Modal | ✅ Complete | Auto-detected GPS coordinates, 6 pollution categories (stubble, factory, diesel, waste, dust), severity tags, and photo upload. |
| **3. Act On It** | **AWS S3 Pre-Signed URL** Evidence Pipeline | ✅ Complete | Direct client-to-S3 upload (`PUT presigned-url`) minimizing server load with IAM least-privilege policies. |
| **3. Act On It** | **Amazon DynamoDB** Integration (`TerraReports` & `TerraPosts`) | ✅ Complete | Serverless database storage with bounding box queries for map beacons and reverse chronological partition key queries for feeds. |
| **3. Act On It** | **Localized Community Social Feed** (Reddit/Twitter Style) | ✅ Complete | 4 Action Categories (🚨 Reports, 🤝 Volunteers with RSVP counters, 💰 Fundraisers with Tailwind progress bars, 💬 Discussions). |
| **3. Act On It** | **AWS Cognito User Pool Auth** Modal | ✅ Complete | Email/password sign-in and sign-up with 1-click evaluation demo profiles for hackathon judges. |
| **4. Cloud Proof** | **Thorough AWS Architecture Documentation** in `README.md` | ✅ Complete | Complete cloud topology diagram, DynamoDB schemas, S3 pre-signed upload pipeline, Lambda source code, and IAM policy templates in README. |
| **4. Cloud Proof** | **AWS Amplify** Setup (`amplify.yml`) | ✅ Complete | Standard production build pipeline configured for Vite React deployment. |
| **5. Product UI/UX** | **Clean, Non-Duplicated Consumer Interface** | ✅ Complete | Removed duplicate buttons, decluttered viewport, unified navigation into sleek TERRA toggle and single clear actions. |

---

## 🛠️ AWS Serverless Implementation Specification

### 1. Amazon DynamoDB Tables
- **`TerraReports`**:
  - `ReportId` (String, Partition Key)
  - `CityName` (String, Global Secondary Index partition)
  - `Latitude` (Number) & `Longitude` (Number)
  - `PollutionType` ('stubble_burning' | 'factory_smoke' | 'vehicle_fleet' | 'waste_burning' | 'construction' | 'illegal_dumping')
  - `Severity` ('moderate' | 'high' | 'critical')
  - `ImageUrl` (String, S3 URI or HTTPS)
  - `Description` (String)
  - `Timestamp` (String, ISO8601, Sort Key)
  - `Status` ('Investigating' | 'Verified' | 'Action Scheduled' | 'Resolved')

- **`TerraPosts`**:
  - `CityName` (String, Partition Key)
  - `Timestamp` (String, Sort Key)
  - `PostId` (String)
  - `PostType` ('complaint' | 'volunteer' | 'fundraise' | 'discuss')
  - `AuthorName` (String) & `AuthorEmail` (String)
  - `Content` (String)
  - `ImageUrl` (String, optional)
  - `TargetGoal` / `CurrentAmount` (Number, for fundraising with live progress)
  - `EventDate` / `RsvpCount` (String / Number, for volunteer events with RSVP toggle)
  - `Upvotes` (Number)

### 2. Amazon S3 Bucket
- Bucket: `terra-evidence-storage`
- Pre-Signed URL operation: `PutObjectCommand` with content-type validation and 15-minute expiry.

### 3. Serverless Lambda Handlers
- `src/aws/lambda/terraReportsLambda.ts`: DynamoDB report writes and spatial bounding-box scans.
- `src/aws/lambda/terraPostsLambda.ts`: Localized community feed queries and post submissions.
- `src/aws/lambda/s3PresignLambda.ts`: Secure AWS S3 Pre-Signed URL issuer.

---

## 📝 Implementation Milestones & Commit Progress
- `0c9f964`: Baseline Terra 3D environmental twin repository setup.
- `b786f65`: UI/UX overhaul: Removed repetitive elements, streamlined TERRA toggle, established clean clinical biological age engine, and created detailed AWS serverless architecture documentation in `README.md`.
- `Latest`: Delhi NCR and Bengaluru dual community feed integration; automatic city detection on zoom in/out with synchronized localized feed; enhanced global AQI grid rendering across the entire world when zoomed out; accessible, friendly 2D-focused UI design.
