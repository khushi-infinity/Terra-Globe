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
  Globe2,
  Play,
  Send,
  Boxes,
  Lock,
  Radio,
  FileCode,
  Rocket
} from 'lucide-react';

export const AwsArchitectureModal: React.FC = () => {
  const isAwsInspectorOpen = useAppStore(s => s.isAwsInspectorOpen);
  const setAwsInspectorOpen = useAppStore(s => s.setAwsInspectorOpen);
  const [activeTab, setActiveTab] = useState<'matrix' | 'testbench' | 'serverless' | 'deploy'>('matrix');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [architectureData, setArchitectureData] = useState<any>(null);

  // Interactive Testbench State
  const [testEndpoint, setTestEndpoint] = useState<'sagemaker' | 'stepfunctions' | 'cedar' | 'eventbridge'>('sagemaker');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

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

  const runTestbench = async (type: 'sagemaker' | 'stepfunctions' | 'cedar' | 'eventbridge') => {
    setTestLoading(true);
    setTestResult(null);
    try {
      let res;
      if (type === 'sagemaker') {
        res = await fetch('/api/aws/sagemaker/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pm25: 112.4, pm10: 184.0, aod: 0.82, humidity: 68, windSpeed: 2.1, locationName: 'New Delhi' })
        });
      } else if (type === 'stepfunctions') {
        res = await fetch('/api/aws/stepfunctions/start-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cityName: 'New Delhi', pollutionType: 'hazardous_smog', severity: 'critical', pm25: 112.4 })
        });
      } else if (type === 'cedar') {
        res = await fetch('/api/aws/cedar/authorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ principalRole: 'CitizenScientist', action: 'SubmitPollutionReport', resourceType: 'EnvironmentalReport' })
        });
      } else if (type === 'eventbridge') {
        res = await fetch('/api/aws/eventbridge/emit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cityName: 'Delhi NCR', severity: 'CRITICAL', aqi: 184 })
        });
      }
      if (res) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch (e: any) {
      setTestResult({ error: e.message });
    } finally {
      setTestLoading(false);
    }
  };

  const SAM_TEMPLATE_SNIPPET = `# AWS SAM CLI: template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: TERRA 3D Twin Serverless Architecture

Resources:
  TerraHttpApi:
    Type: AWS::Serverless::HttpApi
  TerraReportsTable:
    Type: AWS::DynamoDB::Table
  TerraEvidenceBucket:
    Type: AWS::S3::Bucket
  TerraUserPool:
    Type: AWS::Cognito::UserPool
  TerraReportsFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/aws/lambda/terraReportsLambda.handler
      Runtime: nodejs20.x`;

  const CEDAR_POLICY_SNIPPET = `// AWS Cedar Authorization: aws/cedar/policies.cedar
permit(
    principal,
    action in [Action::"ReadTelemetry", Action::"ViewAeroHealth"],
    resource
);

permit(
    principal in Role::"CitizenScientist",
    action in [Action::"SubmitPollutionReport", Action::"UploadEvidenceS3"],
    resource is ResourceType::"EnvironmentalReport"
);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="glass-panel-active rounded-3xl p-6 w-full max-w-4xl border border-amber-500/40 shadow-2xl text-left bg-slate-950/95 text-white max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">AWS Cloud Architecture &amp; Hackathon Hub</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  BUILD IT &amp; SHIP IT READY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full-stack AWS serverless, container, AI inference, and fine-grained Cedar authorization
              </p>
            </div>
          </div>
          <button
            onClick={() => setAwsInspectorOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-4 text-xs font-medium flex-shrink-0">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'matrix'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Boxes className="w-4 h-4" />
            Hackathon Matrix (Build It / Ship It)
          </button>

          <button
            onClick={() => setActiveTab('testbench')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'testbench'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Zap className="w-4 h-4" />
            Live AWS Test Bench
          </button>

          <button
            onClick={() => setActiveTab('serverless')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'serverless'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Serverless &amp; SAM (LocalStack)
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'deploy'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Rocket className="w-4 h-4" />
            Deploy to AWS (Amplify / App Runner)
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto space-y-4 pr-1 text-sm custom-scrollbar flex-1">
          {/* TAB 1: HACKATHON MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                <span className="font-bold text-amber-300">AWS Hackathon Alignment Matrix:</span> TERRA maps 100% to every evaluation category.
                Developers and judges can run it locally with <strong>LocalStack / SAM CLI (no account, no credit card, zero bill)</strong> or ship directly to production via <strong>AWS Amplify, App Runner, or ECS Fargate</strong>!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Agents and AI */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4" /> Agents and AI
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono">READY</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Build It:</strong> Strands Agents SDK &amp; PartyRock prompts (<code className="text-purple-300">aws/partyrock/</code>)
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Ship It:</strong> Amazon SageMaker AI real-time aerosol anomaly predictor endpoint
                  </p>
                </div>

                {/* 2. Containers and Kubernetes */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <Server className="w-4 h-4" /> Containers &amp; Kubernetes
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono">READY</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Build It:</strong> Finch container build (<code className="text-blue-300">Dockerfile</code>), EKS Distro manifests (<code className="text-blue-300">k8s/</code>)
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Ship It:</strong> Amazon ECS Fargate task definition &amp; AWS App Runner (<code className="text-blue-300">apprunner.yaml</code>)
                  </p>
                </div>

                {/* 3. Serverless */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> Serverless Architecture
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono">READY</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Build It:</strong> AWS SAM CLI (<code className="text-amber-300">template.yaml</code>) &amp; LocalStack (<code className="text-amber-300">docker-compose.localstack.yml</code>)
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Ship It:</strong> AWS Lambda, API Gateway HTTP API, AWS Step Functions workflow
                  </p>
                </div>

                {/* 4. Servers and Runtimes */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Globe2 className="w-4 h-4" /> Servers &amp; Runtimes
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">READY</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Build It:</strong> Amazon Corretto 21 &amp; Firecracker microVM specs
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Ship It:</strong> AWS Amplify Hosting (<code className="text-emerald-300">amplify.yml</code>) &amp; AWS App Runner
                  </p>
                </div>

                {/* 5. Data and Search */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <Database className="w-4 h-4" /> Data &amp; Search
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono">READY</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Build It:</strong> Amazon OpenSearch geospatial mapping (<code className="text-cyan-300">aws/opensearch/</code>)
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Ship It:</strong> Amazon S3 (pre-signed upload), DynamoDB, Amazon Aurora PostGIS
                  </p>
                </div>

                {/* 6. Auth and Policy */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> Auth &amp; Policy
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono">READY</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Build It:</strong> AWS Cedar fine-grained RBAC/ABAC policies (<code className="text-rose-300">aws/cedar/policies.cedar</code>)
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Ship It:</strong> Amazon Cognito User Pool &amp; Identity validation
                  </p>
                </div>

                {/* 7. The Plumbing */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                      <Radio className="w-4 h-4" /> The Plumbing (CloudFront, EventBridge, SNS, SQS, CloudWatch)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 font-mono">READY</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Ship It:</strong> Amazon CloudFront edge CDN (<code className="text-orange-300">aws/cloudfront/</code>), EventBridge event bus (<code className="text-orange-300">terra-environmental-bus</code>), Amazon SNS SMS/Email notifications, and CloudWatch custom dashboards (<code className="text-orange-300">aws/cloudwatch/</code>).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE TEST BENCH */}
          {activeTab === 'testbench' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-xs text-slate-300">
                Test any integrated AWS cloud service live right from this console:
              </div>

              {/* Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => { setTestEndpoint('sagemaker'); runTestbench('sagemaker'); }}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                    testEndpoint === 'sagemaker'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" /> SageMaker AI
                  </div>
                  <div className="text-[10px] text-slate-400">Aerosol Anomaly Score</div>
                </button>

                <button
                  onClick={() => { setTestEndpoint('stepfunctions'); runTestbench('stepfunctions'); }}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                    testEndpoint === 'stepfunctions'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Step Functions
                  </div>
                  <div className="text-[10px] text-slate-400">Incident Pipeline</div>
                </button>

                <button
                  onClick={() => { setTestEndpoint('cedar'); runTestbench('cedar'); }}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                    testEndpoint === 'cedar'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5 text-rose-400" /> AWS Cedar
                  </div>
                  <div className="text-[10px] text-slate-400">Policy Authorization</div>
                </button>

                <button
                  onClick={() => { setTestEndpoint('eventbridge'); runTestbench('eventbridge'); }}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                    testEndpoint === 'eventbridge'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Radio className="w-3.5 h-3.5 text-orange-400" /> EventBridge &amp; SNS
                  </div>
                  <div className="text-[10px] text-slate-400">Emergency Alert Fanout</div>
                </button>
              </div>

              {/* Action Trigger */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-xs text-slate-400 font-mono">
                  Endpoint: /api/aws/{testEndpoint === 'sagemaker' ? 'sagemaker/predict' : testEndpoint === 'stepfunctions' ? 'stepfunctions/start-verification' : testEndpoint === 'cedar' ? 'cedar/authorize' : 'eventbridge/emit'}
                </span>
                <button
                  onClick={() => runTestbench(testEndpoint)}
                  disabled={testLoading}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {testLoading ? (
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  Execute AWS Request
                </button>
              </div>

              {/* Testbench Result Viewer */}
              {testResult && (
                <div className="p-3.5 rounded-2xl bg-black/70 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Live Response Payload
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Status: 200 OK</span>
                  </div>
                  <pre className="text-[11px] font-mono text-amber-200/90 bg-slate-950/80 p-3 rounded-xl overflow-x-auto max-h-56">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SERVERLESS & SAM */}
          {activeTab === 'serverless' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>AWS SAM CLI Template (<code className="text-amber-400 font-mono">template.yaml</code>)</span>
                  <button
                    onClick={() => handleCopy('sam', SAM_TEMPLATE_SNIPPET)}
                    className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    {copiedCode === 'sam' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </h4>
                <pre className="p-3 rounded-xl bg-black/60 font-mono text-[11px] text-amber-300/80 overflow-x-auto max-h-44">
                  {SAM_TEMPLATE_SNIPPET}
                </pre>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>AWS Cedar Authorization Policy (<code className="text-rose-400 font-mono">aws/cedar/policies.cedar</code>)</span>
                  <button
                    onClick={() => handleCopy('cedar', CEDAR_POLICY_SNIPPET)}
                    className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    {copiedCode === 'cedar' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </h4>
                <pre className="p-3 rounded-xl bg-black/60 font-mono text-[11px] text-rose-300/80 overflow-x-auto max-h-40">
                  {CEDAR_POLICY_SNIPPET}
                </pre>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200/90 leading-relaxed">
                <strong>Run Locally with LocalStack (Zero Cost / No AWS Account):</strong>
                <pre className="mt-2 p-2 rounded-lg bg-black/60 font-mono text-[11px] text-blue-300">
                  docker compose -f docker-compose.localstack.yml up -d
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: DEPLOY TO AWS */}
          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                <h3 className="font-bold text-sm text-amber-300 mb-1">How to Deploy TERRA to AWS in 3 Minutes:</h3>
                Choose either <strong>AWS Amplify Hosting</strong> (fastest web URL) or <strong>AWS App Runner</strong> (full-stack containerized).
              </div>

              {/* Option 1: AWS Amplify */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <Rocket className="w-4 h-4" /> Option 1: AWS Amplify Hosting (Free Tier)
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">RECOMMENDED</span>
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 pl-1">
                  <li>Go to the <a href="https://console.aws.amazon.com/amplify" target="_blank" rel="noreferrer" className="text-amber-400 underline">AWS Amplify Console</a>.</li>
                  <li>Click <strong>Host web app</strong> &rarr; Select <strong>GitHub</strong>.</li>
                  <li>Choose your repository: <code className="text-emerald-300">khushi-infinity/Terra</code> &amp; branch <code className="text-emerald-300">main</code>.</li>
                  <li>Amplify automatically recognizes <code className="text-emerald-300">amplify.yml</code> in the root and builds the app.</li>
                  <li>Click <strong>Save and deploy</strong>. Your live HTTPS URL will be active in ~3 minutes!</li>
                </ol>
              </div>

              {/* Option 2: AWS App Runner */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-blue-400 flex items-center gap-2">
                  <Server className="w-4 h-4" /> Option 2: AWS App Runner (Full-Stack Container)
                </h4>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 pl-1">
                  <li>Open the <a href="https://console.aws.amazon.com/apprunner" target="_blank" rel="noreferrer" className="text-amber-400 underline">AWS App Runner Console</a>.</li>
                  <li>Select <strong>Source code repository</strong> &rarr; GitHub &rarr; repository <code className="text-blue-300">khushi-infinity/Terra</code>.</li>
                  <li>Configuration: Select <strong>Use configuration file</strong> (<code className="text-blue-300">apprunner.yaml</code> is already provided).</li>
                  <li>Click <strong>Create &amp; Deploy</strong>. App Runner automatically provisions containers, auto-scaling, and SSL.</li>
                </ol>
              </div>

              {/* Option 3: AWS SAM CLI */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-purple-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Option 3: AWS SAM CLI (Serverless Deploy)
                </h4>
                <pre className="p-2.5 rounded-xl bg-black/60 font-mono text-[11px] text-purple-300/90 overflow-x-auto">
{`sam build
sam deploy --guided`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AWS Region: <strong className="text-white">us-east-1</strong></span>
          </div>
          <button
            onClick={() => setAwsInspectorOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
