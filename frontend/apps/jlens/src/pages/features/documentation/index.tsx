import { useState } from "react";
import { ArrowLeft, Sparkles, Brain, FileText, Users, Shield, Zap, MessageSquare, Target, Rocket, CheckCircle2, TrendingUp, BarChart3, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Documentation() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "features", label: "Features" },
    { id: "benefits", label: "Benefits" },
    { id: "howto", label: "How to Use" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#19105B] to-[#8b7bc7] bg-clip-text text-transparent">
            JLENS Documentation
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-[#19105B] border-b-2 border-[#19105B]"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="bg-gradient-to-r from-[#19105B] to-[#8b7bc7] rounded-xl p-8 text-white text-center">
              <img src="/jlens.svg" alt="JLENS" className="h-16 w-auto mx-auto mb-4 filter brightness-0 invert" />
              <p className="text-lg opacity-90 mb-2">JMAN's Private AI Assistant Platform</p>
              <p className="text-sm opacity-80">Your Business Insights Companion</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Clock, value: "10x", label: "Faster Proposals" },
                { icon: DollarSign, value: "99.9%", label: "Uptime" },
                { icon: Brain, value: "5+", label: "AI Models" },
                { icon: BarChart3, value: "100%", label: "Data Privacy" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                    <Icon className="w-6 h-6 mx-auto mb-2 text-[#19105B]" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* What is JLENS */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">What is JLens?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                JLens is JMAN's private, secure AI assistant platform powered by Tenali AI. It enables team members to interact with powerful language models (OpenAI, Claude, DeepSeek, Grok, Llama) in a secure environment to automate work, access knowledge, and collaborate smarter.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Why JLens vs Public AI?</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400 mb-1">✓ JLens Advantage</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Your data stays private</li>
                      <li>• Always available (Azure reliability)</li>
                      <li>• Process client data safely</li>
                      <li>• Understands JMAN context</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400 mb-1">✗ Public AI Risk</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Data shared with AI companies</li>
                      <li>• Dependent on external services</li>
                      <li>• Risk of data exposure</li>
                      <li>• Generic responses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Capabilities */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Brain, title: "Multiple AI Models", desc: "GPT-5, GPT-4.1, Claude, DeepSeek, Llama" },
                { icon: FileText, title: "Sales SharePoint", desc: "SOWs, proposals, pricing instantly" },
                { icon: MessageSquare, title: "AI Proposals", desc: "JMAN-branded proposals in minutes" },
                { icon: Users, title: "Secure Processing", desc: "Client data safely processed" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <Icon className="w-8 h-8 text-[#19105B] mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Access Information */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Getting Started</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-2xl font-bold text-[#19105B] mb-1">1</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Visit Platform</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-2xl font-bold text-[#19105B] mb-1">2</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">JMAN SSO Login</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-2xl font-bold text-[#19105B] mb-1">3</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Choose Workspace</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-2xl font-bold text-[#19105B] mb-1">4</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Start Chatting</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                <strong>URL:</strong> <a href="https://jlens.jmangroup.tech/login" target="_blank" rel="noopener noreferrer" className="text-[#19105B] hover:underline">jlens.jmangroup.tech</a>
              </p>
            </div>
          </div>
        )}

        {activeTab === "features" && (
          <div className="space-y-4">
            {[
              {
                icon: Brain,
                title: "Multiple AI Models",
                desc: "Access GPT-5, GPT-4.1, Claude, DeepSeek, Grok, and Llama. Switch models based on your task for optimal results.",
                color: "from-purple-500 to-blue-500",
              },
              {
                icon: FileText,
                title: "Sales SharePoint Integration",
                desc: "Instant access to SOWs, proposals, pricing, and contracts. Ask questions about years of sales documents.",
                color: "from-green-500 to-teal-500",
              },
              {
                icon: Rocket,
                title: "AI Proposal Generator",
                desc: "Generate professional JMAN-branded proposals in minutes using company-approved templates and business context.",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: MessageSquare,
                title: "Document Query Workspaces",
                desc: "Upload client data and documentation securely. Get intelligent search and precise answers from your documents.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Sparkles,
                title: "JLens Workspace (GPT-like)",
                desc: "Unified chat experience with temporary file processing. Upload and analyze without permanent storage.",
                color: "from-indigo-500 to-purple-500",
              },
              {
                icon: Users,
                title: "Advanced Collaboration",
                desc: "Share workspaces with team members. Export conversations and collaborate on AI-powered analysis.",
                color: "from-pink-500 to-purple-500",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                desc: "Microsoft SSO, private environment, audit trail. Your data never leaves JMAN's secure infrastructure.",
                color: "from-red-500 to-pink-500",
              },
              {
                icon: BarChart3,
                title: "Chart & Data Visualization",
                desc: "6 chart types with Python-to-JSON converter. Visual representation of complex data and insights.",
                color: "from-yellow-500 to-orange-500",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex gap-4 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              );
            })}

            {/* Technical Architecture */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mt-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Technical Architecture</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Backend (Tenali-AI-AZ)</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• FastAPI (Python 3.11+)</li>
                    <li>• PostgreSQL + SQLAlchemy</li>
                    <li>• Azure OpenAI Integration</li>
                    <li>• Azure Blob Storage</li>
                    <li>• JWT + Microsoft SSO</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Frontend (React)</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• React 18 + TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• Microsoft MSAL Auth</li>
                    <li>• Real-time Streaming</li>
                    <li>• Responsive Design</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Workspace Types */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Workspace Types</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: "System", color: "#19105B", desc: "Pre-configured templates (e.g., Jman Sales, AI Proposal)" },
                  { type: "Own", color: "#A16BDB", desc: "Personal workspaces you create and manage" },
                  { type: "Shared", color: "#FF6196", desc: "Collaborative workspaces shared with team members" },
                ].map((ws) => (
                  <div key={ws.type} className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-white text-sm font-bold mb-3" style={{ backgroundColor: ws.color }}>
                      {ws.type.substring(0, 3).toUpperCase()}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{ws.type} Workspaces</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{ws.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Screenshots Showcase */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">JLens in Action</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Sales SharePoint Integration</h4>
                  <img 
                    src="/jlens_images/Jman Sales sharepoint workspace convertions.png" 
                    alt="Sales SharePoint Integration" 
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Ask questions about SOWs, proposals, and pricing documents</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">AI Proposal Generation</h4>
                  <img 
                    src="/jlens_images/AI Proposal.png" 
                    alt="AI Proposal Generation" 
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Generate JMAN-branded proposals with business context</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Document Analysis</h4>
                  <img 
                    src="/jlens_images/JLens workspace convertiosn.png" 
                    alt="Document Analysis" 
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Upload and analyze documents with instant summaries</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Multiple AI Models</h4>
                  <img 
                    src="/jlens_images/Default models.png" 
                    alt="AI Models Selection" 
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Choose from GPT-5, GPT-4.1, Claude, DeepSeek, and Llama</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "benefits" && (
          <div className="space-y-4">
            {/* Business Impact */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800 mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Business Impact</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Productivity Boost</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Generate proposals 10x faster</li>
                    <li>• Instant access to sales knowledge</li>
                    <li>• 24/7 AI assistance availability</li>
                    <li>• Automated document analysis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Competitive Advantage</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Private AI when others are down</li>
                    <li>• Secure client data processing</li>
                    <li>• JMAN context understanding</li>
                    <li>• Multiple premium models</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Benefits */}
            {[
              { icon: TrendingUp, title: "10x Faster Proposals", desc: "Generate professional JMAN-branded proposals in minutes instead of hours", impact: "Save 20+ hrs/week" },
              { icon: Target, title: "Instant Knowledge Access", desc: "Find information from years of sales documents, contracts, and client files in seconds", impact: "95% faster search" },
              { icon: Shield, title: "Secure Client Processing", desc: "Process sensitive client data safely in private environment without external exposure", impact: "100% privacy" },
              { icon: Zap, title: "Always Available", desc: "When OpenAI or other services go down, JLens keeps running on Azure enterprise infrastructure", impact: "99.9% uptime" },
              { icon: Brain, title: "JMAN Context", desc: "AI that understands our business, terminology, and processes for more relevant responses", impact: "Better accuracy" },
              { icon: DollarSign, title: "Cost Efficiency", desc: "Replace multiple AI subscriptions with one comprehensive, enterprise-grade solution", impact: "Reduce costs" },
            ].map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-[#19105B]" />
                      <h3 className="font-bold text-gray-900 dark:text-white">{benefit.title}</h3>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                      {benefit.impact}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">{benefit.desc}</p>
                </div>
              );
            })}

            {/* Use Cases by Department */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Use Cases by Department</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sales Teams</h4>
                  {[
                    { title: "Proposal Generation", desc: "Create proposals using JMAN templates" },
                    { title: "Pricing Intelligence", desc: "Instant access to pricing history" },
                    { title: "Contract Analysis", desc: "Review SOWs and agreements" },
                    { title: "Client Research", desc: "Analyze client documents quickly" },
                  ].map((usecase, i) => (
                    <div key={i} className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                      <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{usecase.title}</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{usecase.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Project Teams</h4>
                  {[
                    { title: "Document Analysis", desc: "Analyze client requirements instantly" },
                    { title: "Knowledge Sharing", desc: "Share insights across team members" },
                    { title: "Research Automation", desc: "Automate routine research tasks" },
                    { title: "Report Generation", desc: "Create summaries and reports" },
                  ].map((usecase, i) => (
                    <div key={i} className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                      <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{usecase.title}</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{usecase.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ROI Metrics */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Expected ROI</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { metric: "Time Savings", value: "80%", desc: "Reduce information search time" },
                  { metric: "Proposal Speed", value: "10x", desc: "Faster proposal generation" },
                  { metric: "Knowledge Retention", value: "100%", desc: "Preserve institutional knowledge" },
                  { metric: "Decision Speed", value: "5x", desc: "Faster data-driven decisions" },
                ].map((roi, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-[#19105B] mb-1">{roi.value}</div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{roi.metric}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{roi.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "howto" && (
          <div className="space-y-6">
            {/* Quick Start */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Start Guide</h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Access JLens", desc: "Visit jlens4o.jmangroup.tech and sign in with your JMAN Microsoft credentials" },
                  { step: "2", title: "Choose AI Model", desc: "Select from GPT-5, GPT-4.1, Claude, DeepSeek, or Llama based on your task" },
                  { step: "3", title: "Select Workspace", desc: "Choose System (Jman Sales, AI Proposal), create Own, or access Shared workspaces" },
                  { step: "4", title: "Start Chatting", desc: "Ask questions directly or upload documents for analysis" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-[#19105B] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Walkthroughs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales SharePoint */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Using Sales SharePoint</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Select "Sales" workspace from System Workspaces</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Switch to "Document Query" mode</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ask about SOWs, pricing, proposals, or contracts</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Review citations and source documents</p>
                  </div>
                </div>
              </div>

              {/* AI Proposals */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Generating AI Proposals</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Select "AI Proposal" from System Workspaces</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Provide client requirements and project details</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI generates JMAN-branded proposal</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Review, customize, and export</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workspace Types */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Understanding Workspaces</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: "System", color: "#19105B", desc: "Pre-configured templates", examples: "Jman Sales, AI Proposal, JLens" },
                  { type: "Own", color: "#A16BDB", desc: "Your personal workspaces", examples: "Client projects, research, documents" },
                  { type: "Shared", color: "#FF6196", desc: "Team collaborative spaces", examples: "Department files, shared projects" },
                ].map((ws) => (
                  <div key={ws.type} className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-white text-sm font-bold mb-3" style={{ backgroundColor: ws.color }}>
                      {ws.type.substring(0, 3).toUpperCase()}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{ws.type} Workspaces</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{ws.desc}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 italic">{ws.examples}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Types */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Chat Types</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">General Chat</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Standard conversational AI for any questions</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Ask any question</li>
                    <li>• Upload files temporarily</li>
                    <li>• Get AI assistance</li>
                    <li>• No permanent storage</li>
                  </ul>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Document Query</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">RAG-based search through workspace documents</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Search workspace files</li>
                    <li>• Get precise answers</li>
                    <li>• View source citations</li>
                    <li>• Hybrid search technology</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Pro Tips for Maximum Productivity
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Use "Document Query" for workspace files, "General" for standalone questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Switch AI models based on task complexity (GPT-5 for complex, GPT-4.1 for speed)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Create dedicated workspaces for different clients or projects</span>
                  </li>
                </ul>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Always check citations to verify AI responses and find source documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Share workspaces with team members for collaborative analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Use JLens workspace for quick document analysis without storage</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Security & Privacy */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Security & Privacy
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Data Security</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Your data never leaves JMAN's environment</li>
                    <li>• Microsoft SSO integration</li>
                    <li>• Enterprise-grade encryption</li>
                    <li>• Audit trail for compliance</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Privacy Features</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Private AI processing</li>
                    <li>• No external data sharing</li>
                    <li>• Secure client data handling</li>
                    <li>• Role-based access control</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-[#19105B] to-[#8b7bc7] rounded-lg p-6 text-white text-center">
          <MessageSquare className="w-10 h-10 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Start Using JLens</h3>
          <p className="text-sm opacity-90 mb-4">Access JMAN's private AI assistant platform</p>
          <a
            href="https://jlens.jmangroup.tech/login"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-white text-[#19105B] font-semibold rounded-lg hover:scale-105 transition-transform"
          >
            Go to JLens
          </a>
        </div>
      </div>
    </div>
  );
}
