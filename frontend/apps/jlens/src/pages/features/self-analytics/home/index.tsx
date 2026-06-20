import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart3, DollarSign, MessageSquare, Zap, ArrowUpDown, ArrowDownUp } from 'lucide-react';

const SComponent = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/my-stats`, {
          withCredentials: true
        });
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-gray-500">Loading...</div></div>;
  if (!data) return <div className="flex items-center justify-center h-screen"><div className="text-gray-500">No data</div></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Usage Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{data.overall.total_requests}</p>
            </div>
            <MessageSquare className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Input Tokens</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{data.overall.total_input_tokens.toLocaleString()}</p>
            </div>
            <ArrowUpDown className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Output Tokens</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{data.overall.total_output_tokens.toLocaleString()}</p>
            </div>
            <ArrowDownUp className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Cost</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${data.overall.total_cost.toFixed(4)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><BarChart3 className="w-6 h-6" />Usage by Model</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Model</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Requests</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Input Tokens</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Output Tokens</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Total Tokens</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Cost</th>
              </tr>
            </thead>
            <tbody>
              {data.by_model.map((stat: any, idx: number) => (
                <tr key={idx} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{stat.model}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{stat.requests}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{stat.input_tokens.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{stat.output_tokens.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{stat.total_tokens.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">${stat.cost.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activity Over Time</h2>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('daily')} className={`px-4 py-2 rounded ${activeTab === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Daily</button>
            <button onClick={() => setActiveTab('monthly')} className={`px-4 py-2 rounded ${activeTab === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Monthly</button>
            <button onClick={() => setActiveTab('yearly')} className={`px-4 py-2 rounded ${activeTab === 'yearly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Yearly</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">{activeTab === 'daily' ? 'Date' : activeTab === 'monthly' ? 'Month' : 'Year'}</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Requests</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Input Tokens</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Output Tokens</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Total Tokens</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Cost</th>
              </tr>
            </thead>
            <tbody>
              {data[activeTab].length > 0 ? data[activeTab].map((stat: any, idx: number) => (
                <tr key={idx} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {activeTab === 'daily' ? new Date(stat.date).toLocaleDateString() : 
                     activeTab === 'monthly' ? `${stat.year}-${String(stat.month).padStart(2, '0')}` : 
                     stat.year}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{stat.requests}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{stat.input_tokens.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{stat.output_tokens.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{stat.total_tokens.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">${stat.cost.toFixed(4)}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No activity yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SComponent;
