# TERRA — 3D Environmental Intelligence, AeroHealth & Citizen Action Platform

> **"See the environment. Understand it. Personalize it. Change it."**

TERRA is a next-generation **3D Environmental Digital Twin and Civic Action Platform** designed to diagnose urban air pollution, calculate personalized biological age impacts, and mobilize grassroots citizen action. It bridges scientific data from Copernicus CAMS and Open-Meteo with modern cloud and serverless infrastructure.

---

## 🌟 The Core Product Loop

1. **See It (3D Spatial Intelligence)**: Explore global atmospheric fields, urban micro-climates, and real-time Air Quality Index (AQI) mapped onto an absolute geographic lattice on a 3D Earth globe.
2. **Personalize It (AeroHealth Biological Age Engine)**: Select any geographic coordinate or city to compute the immediate biological age acceleration on specific organ systems (Lungs, Heart, Skin, Brain), life expectancy hours depleted per month, and clinical disease risks based on Lancet and WHO epidemiological models.
3. **Act On It (Citizen Ground Truth & Community Feed)**: Flag severe pollution sources (stubble burning, factory plumes, diesel corridors, open waste fires) with auto-acquired GPS coordinates and photo evidence, streaming directly to verified municipal feeds and grassroots community drives.

---

## 🏗️ Technical Architecture & AWS Serverless Stack

TERRA uses the **AWS "Ship It" Free Tier Stack** to deliver scalable, serverless performance without heavy server overhead.

```
                      +------------------------------------------+
                      |         AWS Amplify (Hosting)            |
                      |   Vite + React SPA (Continuous Git CI)   |
                      +--------------------+---------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
                   v                                               v
        +----------------------+                       +-----------------------+
        |  AWS Cognito Auth    |                       |  Amazon API Gateway   |
        |  User Pools (JWT)    |                       |  REST / HTTP API v2   |
        +----------------------+                       +-----------+-----------+
                                                                   |
                                          +------------------------+------------------------+
                                          |                        |                        |
                                          v                        v                        v
                                +-------------------+    +-------------------+    +-------------------+
                                | S3 Pre-Sign Lambda|    | TerraReports Lambda|   |  TerraPosts Lambda|
                                +---------+---------+    +---------+---------+    +---------+---------+
                                          |                        |                        |
                                          v                        v                        v
                                +-------------------+    +-------------------+    +-------------------+
                                |     Amazon S3     |    |  Amazon DynamoDB  |    |  Amazon DynamoDB  |
                                | (Evidence Photos) |    |  (TerraReports)   |    |   (TerraPosts)    |
                                +-------------------+    +-------------------+    +-------------------+
```

### 1. Amazon DynamoDB Database Schemas

#### A. Table: `TerraReports` (Citizen Ground Truth Incidents)
- **Primary Partition Key**: `ReportId` (String, e.g. `rep_1728591823_9f81a`)
- **Global Secondary Index (GSI)**: `CityName-Timestamp-Index`
  - Partition Key: `CityName` (String)
  - Sort Key: `Timestamp` (String, ISO8601)
- **Attributes**:
  - `Latitude` (Number) & `Longitude` (Number) — for bounding box map queries
  - `PollutionType` (String: `stubble_burning` | `factory_smoke` | `vehicle_fleet` | `waste_burning` | `construction` | `illegal_dumping`)
  - `Severity` (String: `moderate` | `high` | `critical`)
  - `ImageUrl` (String: S3 object URI or direct HTTPS link)
  - `Description` (String: witness observation text)
  - `Status` (String: `Investigating` | `Verified` | `Action Scheduled` | `Resolved`)
  - `AuthorName` (String)
  - `Upvotes` (Number)

#### B. Table: `TerraPosts` (Localized Community Action Feed)
- **Primary Partition Key**: `CityName` (String) — enables localized city filtering (e.g., Delhi, Bengaluru, Paris)
- **Primary Sort Key**: `Timestamp` (String, ISO8601) — chronological feed ordering
- **Attributes**:
  - `PostId` (String)
  - `PostType` (String: `complaint` | `volunteer` | `fundraise` | `discuss`)
  - `AuthorName` (String) & `AuthorEmail` (String)
  - `AuthorRole` (String: `Citizen Reporter`, `Environmental Scientist`, etc.)
  - `Title` (String) & `Content` (String)
  - `ImageUrl` (String, optional)
  - `TargetGoal` (Number, for clean-air micro-fundraisers)
  - `CurrentAmount` (Number, live community contribution sum)
  - `EventDate` (String, for volunteer cleanup dates)
  - `RsvpCount` (Number, live participant attendance counter)
  - `Upvotes` (Number)
  - `TaggedAuthorities` (List of Strings, e.g. `@DPCC_Official`, `@EPA`)

---

### 2. Amazon S3 Direct Evidence Uploads (Pre-Signed URLs)

To eliminate backend bandwidth bottlenecks and keep serverless compute lightweight:
1. The frontend requests a single-use Pre-Signed Upload URL via `POST /api/aws/s3/presigned-url`.
2. The Lambda function generates a signed `PutObjectCommand` targeting bucket `terra-evidence-storage` with:
   - Expiration TTL: 15 minutes (900 seconds)
   - Strict content-type validation (`image/jpeg`, `image/png`, `image/webp`)
   - Unique key format: `pollution-evidence/{timestamp}-{sanitized_filename}`
3. The browser uploads the binary photo stream directly to Amazon S3 via `PUT {uploadUrl}`.
4. The resulting public or CloudFront URI is stored in DynamoDB.

#### S3 Least-Privilege IAM Policy Template:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3EvidenceUploads",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::terra-evidence-storage/*"
    },
    {
      "Sid": "AllowDynamoDBTerraOperations",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/TerraReports",
        "arn:aws:dynamodb:us-east-1:*:table/TerraPosts"
      ]
    }
  ]
}
```

---

### 3. AWS Lambda Function Implementations

Source code for production serverless Lambda handlers is maintained under `src/aws/lambda/`:
- `src/aws/lambda/terraReportsLambda.ts`: Handles incident ingestion and geographic bounding-box queries (`?north=&south=&east=&west=`).
- `src/aws/lambda/terraPostsLambda.ts`: Handles localized city feed retrieval and new community posts across the 4 action categories.
- `src/aws/lambda/s3PresignLambda.ts`: Issues secure, time-bounded Pre-Signed S3 upload URLs.

---

### 4. AWS Amplify Hosting Deployment (`amplify.yml`)

The repository includes a ready-to-deploy `amplify.yml` build specification:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### Steps to Host on AWS Amplify:
1. Push your repository to GitHub.
2. In the AWS Console, navigate to **AWS Amplify Hosting** and click **Create new app**.
3. Link your GitHub repository and select the target branch.
4. Amplify will automatically detect the root `amplify.yml` configuration.
5. In **Environment variables**, configure:
   - `GEMINI_API_KEY`: Google Gemini API key for biological age and environmental diagnostics.
   - `VITE_MAPBOX_ACCESS_TOKEN`: Mapbox public token for 3D geographic streaming.
6. Click **Save and deploy**.

---

### 5. AWS Cognito Authentication

Citizen identity is managed through AWS Cognito User Pools:
- Self-registration with email and password.
- Role-based permissions (`Citizen Reporter`, `Clean Air Activist`, `Environmental Scientist`, `Municipal Officer`).
- Verified tokens required to publish official incident flags and organize community fundraisers.

---

## 🧬 AeroHealth Biological Age Calculation Engine

The AeroHealth engine computes biological organ wear by modeling excess ambient particulate exposure against the **Global Exposure Mortality Model (GEMM)** (Burnett et al., 2018) and the **Lancet Commission on Pollution and Health**:
- **Baseline WHO Target**: $5\ \mu\text{g/m}^3$ annual mean $\text{PM}_{2.5}$.
- **Physiological Exposure Metric**: Excess particulate dose weighted by daily outdoor exposure hours.
- **Organ-Specific Vulnerabilities**:
  - **Lungs**: Alveolar macrophage phagocytosis overload, irreversible $\text{FEV}_1$ decline.
  - **Heart**: Microvascular endothelial inflammation, coronary artery intima-media thickening.
  - **Skin**: Aryl hydrocarbon receptor (AhR) activation and collagen matrix metalloproteinase wear.
  - **Brain**: Ultrafine particulate translocation across the olfactory bulb causing microglial neuro-inflammation.
- **Life Expectancy Loss**: Hours of life lost per month and annual life expectancy degradation derived from concentration-response hazard ratios.

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- npm or bun

### 2. Installation
```bash
git clone https://github.com/khushi-infinity/Terra.git
cd Terra
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
Apache-2.0
