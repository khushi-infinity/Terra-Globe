import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Cpu,
  X,
  Database,
  Cloud,
  Shield,
  Server,
  Layers,
  Copy,
  CheckCircle2,
  ExternalLink,
  Code2,
  Terminal,
  Activity,
  Zap,
  Globe2
} from 'lucide-react';

export const AwsArchitectureModal: React.FC = () => {
  const isAwsInspectorOpen = useAppStore(s => s.isAwsInspectorOpen);
  const setAwsInspectorOpen = useAppStore(s => s.setAwsInspectorOpen);
  const [activeTab, setActiveTab] = useState<'overview' | 'lambda' | 'dynamodb' | 'amplify'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [architectureData, setArchitectureData] = useState<any>(null);

  useEffect(() => {
    if (isAwsInspectorOpen) {
      fetch('/api/aws/architecture')
        .then(r => r.json())
        .then(data => setArchitectureData(data))
        .catch(() => {});
    }
  }, [isAwsInspectorOpen]);

  if (!isAwsInspectorOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const LAMBDA_REPORT_CODE = `// AWS Lambda Node.js: TerraReportsHandler
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    const item = {
      ReportId: \`rep_\${Date.now()}\`,
      CityName: data.cityName,
      Latitude: Number(data.latitude),
      Longitude: Number(data.longitude),
      PollutionType: data.pollutionType,
      Severity: data.severity,
      ImageUrl: data.imageUrl,
      Description: data.description,
      Timestamp: new Date().toISOString(),
      Status: 'Verified',
      AuthorName: data.authorName
    };
    await docClient.send(new PutCommand({ TableName: 'TerraReports', Item: item }));
    return { statusCode: 201, body: JSON.stringify({ success: true, report: item }) };
  }
};`;

  const AMPLIFY_YML_CODE = `version: 1
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
      - node_modules/**/*`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="glass-panel-active rounded-3xl p-6 w-full max-w-3xl border border-amber-500/40 shadow-2xl text-left bg-slate-950/95 text-white max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-tech uppercase tracking-wide">
                  AWS FREE TIER ARCHITECTURE & SERVERLESS STACK
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SHIP IT STACK
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Full-stack serverless pipeline: AWS Amplify, DynamoDB, Amazon S3, AWS Cognito, Lambda
              </span>
            </div>
          </div>

          <button
            onClick={() => setAwsInspectorOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center rounded-xl bg-black/50 p-1 border border-white/10 text-xs mb-4 flex-shrink-0">
          {[
            { id: 'overview', label: 'Cloud Topology' },
            { id: 'dynamodb', label: 'DynamoDB Schemas' },
            { id: 'lambda', label: 'Serverless Lambda' },
            { id: 'amplify', label: 'Amplify CI/CD' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === t.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Architecture Topology Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/50 border border-cyan-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Globe2 className="w-4 h-4" />
                    <span className="text-xs font-bold font-tech uppercase">AWS Amplify</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Frontend Hosting</span>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Continuous git deployment for Vite SPA with edge distribution.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/50 border border-purple-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold font-tech uppercase">AWS Cognito</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">User Identity</span>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    User pool JWT session verification for citizen authentication.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-bold font-tech uppercase">DynamoDB</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">NoSQL Tables</span>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Tables: <code>TerraReports</code> & <code>TerraPosts</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/50 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Cloud className="w-4 h-4" />
                    <span className="text-xs font-bold font-tech uppercase">Amazon S3</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Photo Storage</span>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Pre-Signed URL direct client uploads to <code>terra-evidence-storage</code>.
                  </p>
                </div>
              </div>

              {/* Live Telemetry Health Status */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-xs font-bold text-white font-tech uppercase block">
                  Active Cloud Infrastructure Configuration
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-[10px] text-slate-500 block uppercase">Region</span>
                    <span className="text-cyan-300 font-bold">{architectureData?.region || 'us-east-1'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-[10px] text-slate-500 block uppercase">DynamoDB Reports</span>
                    <span className="text-emerald-300 font-bold">{architectureData?.activeTables?.reports?.itemCount ?? 4} Records</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-[10px] text-slate-500 block uppercase">DynamoDB Posts</span>
                    <span className="text-amber-300 font-bold">{architectureData?.activeTables?.posts?.itemCount ?? 6} Posts</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-[10px] text-slate-500 block uppercase">S3 Pre-Signed</span>
                    <span className="text-rose-300 font-bold">Active 15m TTL</span>
                  </div>
                </div>
              </div>

              {/* IAM Policy Template */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-semibold uppercase">IAM Least-Privilege Policy:</span>
                  <button
                    onClick={() => handleCopy('iam', JSON.stringify(architectureData?.iamRolePolicy, null, 2))}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode === 'iam' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-[11px] text-slate-300 overflow-x-auto border border-white/5">
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::terra-evidence-storage/*"
    },
    {
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan"],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/TerraReports",
        "arn:aws:dynamodb:us-east-1:*:table/TerraPosts"
      ]
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'dynamodb' && (
            <div className="space-y-4">
              {/* Table 1: TerraReports */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold uppercase text-sm">Table: TerraReports</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    On-Demand Capacity
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  Stores georeferenced pollution reports flagged by citizens with GPS coordinates and S3 photo evidence.
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1 text-[11px] text-slate-300">
                  <div>• <strong>Partition Key</strong>: <code>ReportId</code> (String)</div>
                  <div>• <strong>Global Secondary Index</strong>: <code>CityName-Timestamp-Index</code> (Partition: CityName, Sort: Timestamp)</div>
                  <div>• <strong>Attributes</strong>: Latitude (N), Longitude (N), PollutionType (S), Severity (S), ImageUrl (S), Description (S), Status (S), Upvotes (N)</div>
                </div>
              </div>

              {/* Table 2: TerraPosts */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold uppercase text-sm">Table: TerraPosts</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    On-Demand Capacity
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  Powers the localized social feed across 4 action categories (Complaint, Volunteer, Fundraise, Discuss).
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1 text-[11px] text-slate-300">
                  <div>• <strong>Partition Key</strong>: <code>CityName</code> (String) — allows micro-locality queries</div>
                  <div>• <strong>Sort Key</strong>: <code>Timestamp</code> (String, ISO8601) — allows instant chronological feeds</div>
                  <div>• <strong>Attributes</strong>: PostId (S), PostType (S), AuthorName (S), Title (S), Content (S), ImageUrl (S), TargetGoal (N), CurrentAmount (N), EventDate (S), RsvpCount (N), Upvotes (N)</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lambda' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">AWS Lambda Function: TerraReportsHandler</span>
                  <button
                    onClick={() => handleCopy('lambda', LAMBDA_REPORT_CODE)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode === 'lambda' ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-[11px] text-slate-300 overflow-x-auto border border-white/5 max-h-60">
                  {LAMBDA_REPORT_CODE}
                </pre>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/10 text-xs text-slate-300 space-y-1 font-sans">
                <span className="text-white font-semibold">Deployment via AWS SAM or Serverless CLI:</span>
                <p className="font-mono text-[11px] text-slate-400">
                  <code>sam deploy --guided</code> with template configured for API Gateway HTTP API v2 integration.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'amplify' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold">amplify.yml Build Configuration</span>
                  <button
                    onClick={() => handleCopy('amplify', AMPLIFY_YML_CODE)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode === 'amplify' ? 'Copied' : 'Copy YAML'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-[11px] text-slate-300 overflow-x-auto border border-white/5">
                  {AMPLIFY_YML_CODE}
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-slate-300 font-sans">
                <span className="text-white font-semibold uppercase text-xs font-tech">
                  Step-by-Step AWS Amplify Deployment Guide:
                </span>
                <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-400">
                  <li>Push your repository to GitHub.</li>
                  <li>In the AWS Console, open <strong>AWS Amplify Hosting</strong> and click <strong>Host web app</strong>.</li>
                  <li>Select GitHub, authorize, and pick the repository and branch.</li>
                  <li>Amplify will automatically detect <code>amplify.yml</code> in the root directory.</li>
                  <li>In <strong>Environment variables</strong>, add <code>VITE_MAPBOX_ACCESS_TOKEN</code> and <code>GEMINI_API_KEY</code>.</li>
                  <li>Click <strong>Save and deploy</strong>. Your production app is live on a <code>*.amplifyapp.com</code> domain in under 3 minutes!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
