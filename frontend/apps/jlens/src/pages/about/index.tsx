import { ArrowLeft, Brain, FileText, Users, MessageSquare, Clock, DollarSign, BarChart3, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#19105B] to-[#8b7bc7] bg-clip-text text-transparent">
            About JLens
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-[#19105B] to-[#8b7bc7] rounded-xl p-8 text-white text-center mb-6">
          <img src="/jlens.svg" alt="JLENS" className="h-16 w-auto mx-auto mb-4 filter brightness-0 invert" />
          <p className="text-lg opacity-90 mb-2">JMAN's Private AI Assistant Platform</p>
          <div className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-lg font-semibold">
            Version 5.0
          </div>
        </div>

        {/* Team & Credits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">Development Team</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white">SATHISH KUMAR V</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">TenaliAI and JLens</p>
              <a href="mailto:sathishkumar@jmangroup.com" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                sathishkumar@jmangroup.com
              </a>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white">BHARANI ASWATH R</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">TenaliAI and JLens</p>
              <a href="mailto:bharani.r@jmangroup.com" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                bharani.r@jmangroup.com
              </a>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white">VASANTHKUMAR J</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">JLens and Self Analytics</p>
              <a href="mailto:vasantha.j@jmangroup.com" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                vasantha.j@jmangroup.com
              </a>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white">KISHORE</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Proposal</p>
              <a href="mailto:kishore@jmangroup.com" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                kishore@jmangroup.com
              </a>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white">HARI RAJ GS</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">MCP</p>
              <a href="mailto:hariraj.gs@jmangroup.com" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                hariraj.gs@jmangroup.com
              </a>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white">HARSH VERMA</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">DevOps</p>
              <a href="mailto:harsh.v@jmangroup.com" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                harsh.v@jmangroup.com
              </a>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Built with passion by the JMAN AI Innovation Team
            </p>
            <div className="flex justify-center items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Powered by Tenali AI</span>
              <span>•</span>
              <span>Azure Cloud Infrastructure</span>
              <span>•</span>
              <span>Enterprise Security</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#19105B] to-[#8b7bc7] rounded-lg p-6 text-white text-center">
          <MessageSquare className="w-10 h-10 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">© 2024 JMAN Group. All rights reserved.</h3>
          <p className="text-sm opacity-90 mb-4">Experience the power of private AI for enterprise</p>
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

export default AboutPage;
