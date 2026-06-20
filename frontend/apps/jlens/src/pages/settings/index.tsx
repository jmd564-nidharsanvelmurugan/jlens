import { Settings, Search, Check, X, Shield, Folder, BarChart3, Plus, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@ui/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

interface UserAccess {
  email: string;
  name: string;
  access: {
    models: string[];
    workspaces: Array<{id: string; name: string; owner: string}>;
  };
}

export default function SettingsPage() {
  const [users, setUsers] = useState<UserAccess[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{email: string; name: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<Array<{id: string; name: string; description: string}>>([]);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<Array<{id: string; name: string; description: string}>>([]);
  const [activeTab, setActiveTab] = useState<"access" | "usage" | "feedbacks">("access");
  const [adminStats, setAdminStats] = useState<any>(null);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  
  // Modal states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user-access/settings-data`, {
        withCredentials: true  // Send cookies
      });

      setSettingsData(response.data);
      setAvailableModels(response.data.models);
      setAvailableWorkspaces(response.data.system_workspaces);
      
      // Set current user as selected by default
      setSelectedUser(response.data.current_user.email);
      setUsers([response.data.current_user]);
    } catch (error) {
      console.error('❌ Failed to fetch settings data:', error);
      // Fallback data
      setAvailableModels([
        {id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", description: "Claude Sonnet 4.5 via Azure AI Foundry"},
        {id: "model-router", name: "Model Router", description: "Intelligent model routing"},
        {id: "gpt-5.1-chat", name: "GPT-5.1 Chat", description: "GPT-5.1 Chat model"}
      ]);
      setAvailableWorkspaces([]);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user-access/admin/all-users`, {
        withCredentials: true  // Send cookies
      });
      setAllUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch all users:', error);
    }
  };

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/feedback/all`, {
        withCredentials: true  // Send cookies
      });
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
      toast.error('Failed to load feedbacks');
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const [expandedDays, setExpandedDays] = useState<{[key: string]: boolean}>({});

  const toggleDayExpansion = (date: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const updateUserRole = async (userEmail: string, newRole: string) => {
    try {
      
      
      // Find user ID from searchedUsers data
      const user = searchedUsers.find((u: any) => u.email === userEmail);
      if (!user) {
        toast.error('User not found');
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/user-access/admin/update-user-role/${user.id}?role=${newRole}`,
        {},
        {
          withCredentials: true
        }
      );

      if (response.data) {
        toast.success(`User role updated to ${newRole}`);
        // Update the user role in searchedUsers state directly
        setSearchedUsers(prev => prev.map(u => 
          u.email === userEmail ? { ...u, role: newRole } : u
        ));
      }
    } catch (error: any) {
      console.error('Failed to update user role:', error);
      toast.error(error.response?.data?.detail || 'Failed to update user role');
    }
  };

  const fetchAdminStats = async (clientFilter?: string) => {
    try {
      
      const url = clientFilter 
        ? `${import.meta.env.VITE_API_URL}/analytics/admin/stats?client_name=${clientFilter}`
        : `${import.meta.env.VITE_API_URL}/analytics/admin/stats`;
      
      const response = await axios.get(url, {
        withCredentials: true
      });
      setAdminStats(response.data);
    } catch (error: any) {
      console.error('Failed to fetch admin stats:', error);
      if (error.response?.status === 403) {
        toast.error('Admin access required for usage analytics');
      } else {
        toast.error('Failed to load usage analytics');
      }
    }
  };

  const searchUserByEmail = async (email: string) => {
    try {
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user-access/admin/user-search?email=${encodeURIComponent(email)}`, {
        withCredentials: true
      });

      
      // Add user to users list if not already there
      const existingUser = users.find(u => u.email === email);
      if (!existingUser) {
        setUsers(prev => [...prev, response.data]);
      } else {
        // Update existing user data
        setUsers(prev => prev.map(u => u.email === email ? response.data : u));
      }
      
      setSelectedUser(email);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to search user:', error);
      if (error.response?.status === 404) {
        toast.error("User not found");
      } else {
        toast.error("Failed to search user");
      }
      return null;
    }
  };



  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user-access/admin/suggest-users?query=${encodeURIComponent(query)}`, {
        withCredentials: true
      });
      setSuggestions(response.data.slice(0, 3));
    } catch (error) {
      setSuggestions([]);
    }
  };

  const handleSearch = async (email?: string) => {
    const searchEmail = email || searchQuery;
    if (!searchEmail.trim()) {
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);
    try {
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user-access/admin/search-user?email=${encodeURIComponent(searchEmail)}`, {
        withCredentials: true
      });
      
      if (response.data) {
        setUsers([response.data]);
        setSelectedUser(response.data.email);
        
        // Add to searched users if not already there
        const existingSearchedUser = searchedUsers.find(u => u.email === response.data.email);
        if (!existingSearchedUser) {
          setSearchedUsers(prev => [...prev, response.data]);
        } else {
          // Update existing searched user data
          setSearchedUsers(prev => prev.map(u => u.email === response.data.email ? response.data : u));
        }
      } else {
        toast.error("User not found");
        setUsers([]);
      }
    } catch (error) {
      toast.error("Error searching user");
      setUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      fetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (email: string) => {
    setSearchQuery(email);
    handleSearch(email);
  };

  const selectedUserData = users.find(u => u.email === selectedUser);

  const toggleAccess = (component: string, type: string, enabled: boolean) => {
    if (!selectedUser) return;
    setPendingChanges(prev => {
      const changes = prev[selectedUser] || [];
      const existing = changes.find(c => c.component === component && c.component_type === type);
      
      if (existing) {
        return { ...prev, [selectedUser]: changes.filter(c => !(c.component === component && c.component_type === type)) };
      }
      
      return { ...prev, [selectedUser]: [...changes, { component, component_type: type, enabled: !enabled }] };
    });
  };

  const isEnabled = (component: string, type: string) => {
    if (!selectedUserData) return false;
    const pending = pendingChanges[selectedUser]?.find(c => c.component === component && c.component_type === type);
    if (pending) return pending.enabled;
    
    if (type === "MODEL" || type === "model") return selectedUserData.access.models.includes(component);
    if (type === "workspace") return selectedUserData.access.workspaces?.some(w => w.id === component) || false;
    if (type === "system_workspace_template") {
      return selectedUserData.access.workspaces?.some(w => w.id === component && w.is_system_workspace) || false;
    }
    return false;
  };

  const saveChanges = async () => {
    if (!selectedUser || !pendingChanges[selectedUser]?.length) return;
    setLoading(true);
    try {
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user-access/admin/update-user-access`, {
        user_email: selectedUser,
        access_changes: pendingChanges[selectedUser]
      }, {
        withCredentials: true
      });
      
      // Check for errors in response
      if (response.data.updated) {
        const errors = response.data.updated.filter((msg: string) => msg.startsWith('Error:'));
        if (errors.length > 0) {
          errors.forEach((err: string) => toast.error(err.replace('Error: ', '')));
        } else {
          toast.success("Access updated");
        }
      }
      
      const newChanges = { ...pendingChanges };
      delete newChanges[selectedUser];
      setPendingChanges(newChanges);
      await fetchSettingsData(); // Refresh the current user data
      await fetchAllUsers();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const allComponents = {
    models: availableModels.map(m => m.id)
  };

  const pendingCount = selectedUser && pendingChanges[selectedUser] ? pendingChanges[selectedUser].length : 0;

  const createUser = async (userData: {email: string, name: string, password: string, designation?: string}) => {
    try {
      

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user-access/admin/create-user`, userData, {
        withCredentials: true
      });

      toast.success("User created successfully");
      setShowCreateUser(false);
      // Add newly created user to searched users
      const newUser = {
        email: userData.email,
        name: userData.name,
        role: 'user',
        client_name: 'jlens'
      };
      setSearchedUsers(prev => [...prev, newUser]);
    } catch (error: any) {
      console.error('Create user error:', error.response?.data || error);
      if (error.response?.status === 403) {
        toast.error("Admin access required. Please contact your administrator.");
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || "Invalid user data");
      } else {
        toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to create user");
      }
    }
  };

  const createFeature = async (featureData: {name: string, description?: string}) => {
    try {
      
      await axios.post(`${import.meta.env.VITE_API_URL}/user-access/admin/create-feature`, featureData, {
        withCredentials: true
      });
      toast.success("Feature created successfully");
      setShowAddComponent(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create feature");
    }
  };

  const createModel = async (modelData: {name: string, description?: string}) => {
    try {
      
      await axios.post(`${import.meta.env.VITE_API_URL}/user-access/admin/create-model`, modelData, {
        withCredentials: true
      });
      toast.success("Model created successfully");
      setShowAddModel(false);
      fetchModels();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create model");
    }
  };

  if (!settingsData) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="bg-white px-6 py-4">
          <h1 className="text-2xl font-bold text-[#19105B]">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage user access and usage details</p>
        </div>
        <div className="flex-1 p-6 space-y-4">
          <div className="flex gap-2 mb-6">
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#19105B]">Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage user access and usage details</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab("access");
                // Don't auto-fetch all users, let search handle it
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "access"
                  ? "bg-[#19105B] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Access Control
            </button>
            <button
              onClick={() => {
                setActiveTab("usage");
                fetchAdminStats();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "usage"
                  ? "bg-[#19105B] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Usage Analytics
            </button>
            <button
              onClick={() => {
                setActiveTab("feedbacks");
                fetchFeedbacks();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "feedbacks"
                  ? "bg-[#19105B] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Feedbacks
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "access" ? (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Single Container Box */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Search & Actions Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user by email (press Enter)..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchKeyPress}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19105B]/20 border border-gray-200"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.email)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{suggestion.name}</div>
                        <div className="text-xs text-gray-500">{suggestion.email}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                onClick={() => setShowCreateUser(true)}
                className="bg-[#19105B] hover:bg-[#19105B]/90 text-white shadow-sm"
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </Button>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                  }}
                  className="text-xs text-gray-600 hover:text-[#19105B] px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* User Info */}
          {selectedUserData && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-semibold">{selectedUserData.name}</h2>
                <p className="text-sm text-gray-500">{selectedUserData.email}</p>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {selectedUserData ? (
              <div className="space-y-6">
              {/* User Role Management */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#19105B]/10 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-[#19105B]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">User Roles</h3>
                      <p className="text-xs text-gray-500">Manage admin and user permissions</p>
                    </div>
                  </div>
                  {searchedUsers.length > 0 && (
                    <button
                      onClick={() => setSearchedUsers([])}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear Results
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {searchedUsers && searchedUsers.length > 0 ? (
                    searchedUsers.map((user: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#19105B] to-[#A16BDB] rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <p className="text-xs text-blue-600 capitalize">{user.client_name || 'jlens'} Platform</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Current Role</p>
                            <p className={`text-sm font-semibold ${user.role === 'admin' ? 'text-[#19105B]' : 'text-gray-700'}`}>
                              {user.role === 'admin' ? 'Administrator' : 'User'}
                            </p>
                          </div>
                          <select
                            value={user.role || 'user'}
                            onChange={(e) => updateUserRole(user.email, e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19105B]/20 focus:border-[#19105B]"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <UserPlus className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">Search for users to manage their roles</p>
                      <p className="text-xs text-gray-400 mt-1">Use the search bar above to find specific users</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Models */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#19105B]/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#19105B]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">AI Models</h3>
                      <p className="text-xs text-gray-500">
                        {(settingsData?.current_user?.access?.models?.length || selectedUserData?.access?.models?.length || 0)} of {availableModels.length} enabled
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        allComponents.models.forEach(m => {
                          if (!isEnabled(m, "model")) toggleAccess(m, "model", false);
                        });
                      }}
                      className="px-3 py-1.5 text-xs font-medium bg-[#19105B] text-white rounded-lg hover:bg-[#19105B]/90 transition-colors"
                    >
                      Enable All
                    </button>
                    <button
                      onClick={() => setShowAddModel(true)}
                      className="px-3 py-1.5 text-xs font-medium bg-[#19105B] text-white rounded-lg hover:bg-[#19105B]/90 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add New
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {availableModels.map((model) => {
                    const hasAccess = isEnabled(model.id, "model");
                    const hasPendingChange = pendingChanges[selectedUser]?.find(c => c.component === model.id && c.component_type === "model");
                    return (
                      <button
                        key={model.id}
                        onClick={() => toggleAccess(model.id, "model", hasAccess)}
                        className={`p-4 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                          hasAccess
                            ? 'border-[#19105B] bg-[#19105B]/5 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${hasPendingChange ? 'ring-2 ring-orange-200 border-orange-300' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`truncate font-semibold ${hasAccess ? 'text-[#19105B]' : 'text-gray-700'}`}>
                            {model.name}
                          </span>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            hasAccess ? 'bg-[#19105B] text-white' : 'bg-gray-200'
                          }`}>
                            {hasAccess ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-gray-400" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          {model.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {hasAccess ? 'Access granted' : 'No access'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* System Workspaces */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#19105B]/10 rounded-lg flex items-center justify-center">
                      <Folder className="w-5 h-5 text-[#19105B]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">System Workspaces</h3>
                      <p className="text-xs text-gray-500">
                        {(settingsData?.current_user?.access?.workspaces?.length || selectedUserData?.access?.workspaces?.length || 0)} of {availableWorkspaces.length} enabled
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateWorkspace(true)}
                    className="px-3 py-1.5 text-xs font-medium bg-[#19105B] text-white rounded-lg hover:bg-[#19105B]/90 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Create System Workspace
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {availableWorkspaces.map((workspace) => {
                    const hasAccess = isEnabled(workspace.id, "system_workspace_template");
                    const hasPendingChange = pendingChanges[selectedUser]?.find(c => c.component === workspace.id && c.component_type === "system_workspace_template");
                    return (
                      <button
                        key={workspace.id}
                        onClick={() => toggleAccess(workspace.id, "system_workspace_template", hasAccess)}
                        className={`p-4 rounded-lg border-2 text-sm transition-all text-left ${
                          hasAccess
                            ? 'border-[#19105B] bg-[#19105B]/5 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${hasPendingChange ? 'ring-2 ring-orange-200 border-orange-300' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`truncate font-medium ${hasAccess ? 'text-[#19105B]' : 'text-gray-700'}`}>
                            {workspace.name}
                          </span>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            hasAccess ? 'bg-[#19105B] text-white' : 'bg-gray-200'
                          }`}>
                            {hasAccess ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-gray-400" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1 line-clamp-2">{workspace.description}</p>
                        <p className="text-xs text-gray-400">{hasAccess ? 'Access granted' : 'No access'}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )
           : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <Settings className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Search for a user to manage access</p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Bar */}
        {pendingCount > 0 && (
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">{pendingCount}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Unsaved Changes</p>
                    <p className="text-xs text-gray-500">{pendingCount} permission{pendingCount > 1 ? 's' : ''} modified</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newChanges = { ...pendingChanges };
                      delete newChanges[selectedUser];
                      setPendingChanges(newChanges);
                    }}
                    className="h-10"
                  >
                    Cancel Changes
                  </Button>
                  <Button 
                    onClick={saveChanges} 
                    disabled={loading}
                    className="h-10 bg-[#19105B] hover:bg-[#19105B]/90 text-white"
                  >
                    {loading ? "Saving..." : `Save ${pendingCount} Change${pendingCount > 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      </div>
      ) : activeTab === "usage" ? (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Usage Analytics Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Usage Analytics</h2>
                <p className="text-sm text-gray-500">
                  {adminStats?.client_filter 
                    ? `Showing data for ${adminStats.client_filter} platform` 
                    : 'System-wide usage statistics and insights'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Client Filter Dropdown */}
                <select
                  value={selectedClient}
                  onChange={(e) => {
                    setSelectedClient(e.target.value);
                    fetchAdminStats(e.target.value || undefined);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#19105B] focus:border-transparent"
                >
                  <option value="">All Platforms</option>
                  {adminStats?.by_client?.map((client: any) => (
                    <option key={client.client_name} value={client.client_name}>
                      {client.client_name === 'jlens' ? 'JLens Platform' : 
                       client.client_name === 'marketplace' ? 'Marketplace Platform' : 
                       `${client.client_name} Platform`}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => fetchAdminStats(selectedClient || undefined)}
                  className="px-4 py-2 bg-[#19105B] text-white rounded-lg hover:bg-[#19105B]/90 transition-colors flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Refresh Stats
                </button>
              </div>
            </div>

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Total Users</p>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{adminStats?.total_users || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {adminStats?.top_users?.filter((u: any) => u.requests > 0).length || 0} active
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Total Requests</p>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{adminStats?.overall?.total_requests?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {adminStats?.monthly?.[0] ? `${adminStats.monthly[0].requests} this month` : 'No activity'}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Total Tokens</p>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">T</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{adminStats?.overall?.total_tokens?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {adminStats?.overall?.input_tokens?.toLocaleString() || 0} in + {adminStats?.overall?.output_tokens?.toLocaleString() || 0} out
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Total Cost</p>
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-orange-600">$</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">${adminStats?.overall?.total_cost?.toFixed(4) || '0.0000'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${((adminStats?.overall?.total_cost || 0) / Math.max(adminStats?.overall?.total_requests || 1, 1)).toFixed(6)} per request
                </p>
              </div>
            </div>

            {/* Usage Insights Grid */}
            <div className="space-y-6">
              
              {/* Platform Breakdown and Top Users - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Client Platform Breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Platform Breakdown</h3>
                    <p className="text-sm text-gray-500">Usage distribution by client platform</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {adminStats?.by_client && adminStats.by_client.length > 0 ? (
                        adminStats.by_client.map((client: any, index: number) => {
                          const totalRequests = adminStats.overall.total_requests || 1;
                          const totalCost = adminStats.overall.total_cost || 1;
                          const requestPercentage = Math.round((client.requests / totalRequests) * 100);
                          const costPercentage = Math.round((client.cost / totalCost) * 100);
                          
                          return (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 capitalize">
                                    {client.client_name === 'jlens' ? 'JLens Platform' : 
                                     client.client_name === 'marketplace' ? 'Marketplace Platform' : 
                                     `${client.client_name} Platform`}
                                  </p>
                                  <p className="text-xs text-gray-500">{client.users} users • {client.requests} requests</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-[#19105B]">${client.cost.toFixed(4)}</p>
                                  <p className="text-xs text-gray-500">{costPercentage}% of total cost</p>
                                </div>
                              </div>
                              
                              {/* Progress bars */}
                              <div className="space-y-2">
                                <div>
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Usage Share</span>
                                    <span>{requestPercentage}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${requestPercentage}%` }}></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Cost Share</span>
                                    <span>{costPercentage}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-[#19105B] h-2 rounded-full transition-all duration-300" style={{ width: `${costPercentage}%` }}></div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Platform metrics */}
                              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Avg Cost/User</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    ${client.users > 0 ? (client.cost / client.users).toFixed(4) : '0.0000'}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Avg Requests/User</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {client.users > 0 ? Math.round(client.requests / client.users) : 0}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BarChart3 className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500">No platform data yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Users Performance */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Top Users</h3>
                    <p className="text-sm text-gray-500">Most active users by requests and cost</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {adminStats?.top_users && adminStats.top_users.length > 0 ? (
                        adminStats.top_users
                          .filter((user: any) => user.requests > 0)
                          .slice(0, 5)
                          .map((user: any, index: number) => {
                            const totalRequests = adminStats.overall.total_requests || 1;
                            const userPercentage = Math.round((user.requests / totalRequests) * 100);
                            return (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#19105B] to-[#A16BDB] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                      {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                      <span className="text-xs text-white font-bold">#{index + 1}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                    <p className="text-xs text-blue-600 capitalize">{user.client_name} Platform</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">{user.requests}</p>
                                    <p className="text-xs text-gray-500">{userPercentage}% of total</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-[#19105B]">${user.cost.toFixed(4)}</p>
                                    <p className="text-xs text-gray-500">{user.total_tokens.toLocaleString()} tokens</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserPlus className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500">No active users yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Performance */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Model Performance</h3>
                  <p className="text-sm text-gray-500">Usage and efficiency by AI model</p>
                </div>
                <div className="p-6">
                  {adminStats?.by_model && adminStats.by_model.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {adminStats.by_model.map((model: any, index: number) => {
                        const totalRequests = adminStats.overall.total_requests || 1;
                        const totalCost = adminStats.overall.total_cost || 1;
                        const requestPercentage = Math.round((model.requests / totalRequests) * 100);
                        const costPercentage = Math.round((model.cost / totalCost) * 100);
                        const avgCostPerRequest = model.requests > 0 ? (model.cost / model.requests) : 0;
                        const avgTokensPerRequest = model.requests > 0 ? (model.total_tokens / model.requests) : 0;
                        
                        return (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-900 capitalize">
                                  {model.model === 'unknown' ? 'Legacy Model' : model.model}
                                </p>
                                <p className="text-xs text-gray-500">{model.requests} requests</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-[#19105B]">${model.cost.toFixed(4)}</p>
                                <p className="text-xs text-gray-500">{costPercentage}%</p>
                              </div>
                            </div>
                            
                            {/* Progress bars */}
                            <div className="space-y-2 mb-3">
                              <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Usage</span>
                                  <span>{requestPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${requestPercentage}%` }}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Cost</span>
                                  <span>{costPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-[#19105B] h-2 rounded-full transition-all duration-300" style={{ width: `${costPercentage}%` }}></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Efficiency metrics */}
                            <div className="grid grid-cols-1 gap-2 pt-3 border-t border-gray-200">
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Avg Cost/Request</span>
                                <span className="text-xs font-semibold text-gray-900">${avgCostPerRequest.toFixed(6)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Avg Tokens/Request</span>
                                <span className="text-xs font-semibold text-gray-900">{Math.round(avgTokensPerRequest).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No model usage data yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            {adminStats?.monthly && adminStats.monthly.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
                  <p className="text-sm text-gray-500">Usage patterns over time</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {adminStats.monthly.slice(0, 3).map((month: any, index: number) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {new Date(month.year, month.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </h4>
                          <div className="w-8 h-8 bg-[#19105B] rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Requests</span>
                            <span className="text-sm font-semibold text-gray-900">{month.requests.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Tokens</span>
                            <span className="text-sm font-semibold text-gray-900">{month.total_tokens.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Cost</span>
                            <span className="text-sm font-semibold text-[#19105B]">${month.cost.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Daily Analytics */}
            {adminStats?.daily && adminStats.daily.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Daily Analytics</h3>
                  <p className="text-sm text-gray-500">Day-wise requests, cost and active users (Last 7 days)</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    {adminStats.daily.slice(0, 7).map((day: any, index: number) => {
                      const dayUsers = adminStats.daily_users?.filter((user: any) => user.date === day.date) || [];
                      const isExpanded = expandedDays[day.date] || false;
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Day Summary */}
                          <div 
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                            onClick={() => toggleDayExpansion(day.date)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">
                                  {new Date(day.date).getDate()}
                                </span>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900">
                                  {new Date(day.date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {new Date(day.date).toLocaleDateString('en-US', { year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Requests</p>
                                <p className="text-sm font-semibold text-gray-900">{day.requests.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Cost</p>
                                <p className="text-sm font-semibold text-[#19105B]">${day.cost.toFixed(4)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Active Users</p>
                                <p className="text-sm font-semibold text-green-600">{day.active_users || 0}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Tokens</p>
                                <p className="text-sm font-semibold text-gray-700">{day.total_tokens.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                  ▼
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* User Breakdown */}
                          {isExpanded && dayUsers.length > 0 && (
                            <div className="bg-gray-50 border-t border-gray-200">
                              <div className="p-4">
                                <h5 className="text-sm font-medium text-gray-700 mb-3">User Breakdown</h5>
                                <div className="space-y-2">
                                  {dayUsers.map((user: any, userIndex: number) => (
                                    <div key={userIndex} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-[#19105B] to-[#A16BDB] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                          {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                          <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className="text-center">
                                          <p className="text-xs text-gray-500">Requests</p>
                                          <p className="text-sm font-semibold text-gray-900">{user.requests}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs text-gray-500">Tokens</p>
                                          <p className="text-sm font-semibold text-blue-600">{user.total_tokens.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs text-gray-500">Cost</p>
                                          <p className="text-sm font-semibold text-[#19105B]">${user.cost.toFixed(4)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {adminStats.daily.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No daily data available yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* System Health Indicators */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                <p className="text-sm text-gray-500">Platform usage indicators</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {Math.round(((adminStats?.top_users?.filter((u: any) => u.requests > 0).length || 0) / Math.max(adminStats?.total_users || 1, 1)) * 100)}%
                    </p>
                    <p className="text-xs text-gray-500">User Adoption</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {adminStats?.overall?.total_requests ? Math.round(adminStats.overall.total_requests / Math.max(adminStats.top_users?.filter((u: any) => u.requests > 0).length || 1, 1)) : 0}
                    </p>
                    <p className="text-xs text-gray-500">Avg Requests/User</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-purple-600">T</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {adminStats?.overall?.total_requests ? Math.round(adminStats.overall.total_tokens / adminStats.overall.total_requests) : 0}
                    </p>
                    <p className="text-xs text-gray-500">Avg Tokens/Request</p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-orange-600">$</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      ${adminStats?.overall?.total_requests ? (adminStats.overall.total_cost / adminStats.overall.total_requests).toFixed(6) : '0.000000'}
                    </p>
                    <p className="text-xs text-gray-500">Avg Cost/Request</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "feedbacks" ? (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Feedbacks Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">User Feedbacks</h2>
                <p className="text-sm text-gray-500 mt-0.5">View and analyze user feedback submissions</p>
              </div>
            </div>

            {/* Feedbacks Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">All Feedbacks</h3>
                  <div className="text-sm text-gray-500">
                    {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} received
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {loadingFeedbacks ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#19105B] mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading feedbacks...</p>
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">💬</span>
                    </div>
                    <p className="text-sm text-gray-500">No feedbacks received yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((feedback: any) => (
                      <div key={feedback.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-[#19105B] to-[#A16BDB] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {feedback.user_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{feedback.user_name}</p>
                                <p className="text-xs text-gray-500">{feedback.user_email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`text-lg ${
                                      star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {feedback.rating}/5 stars
                              </span>
                            </div>
                            
                            {feedback.comment && (
                              <div className="bg-gray-50 rounded-md p-3 mt-2">
                                <p className="text-sm text-gray-700">{feedback.comment}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right ml-4">
                            <p className="text-xs text-gray-500">
                              {new Date(feedback.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Statistics */}
            {feedbacks.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Feedback Statistics</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((rating) => {
                      const count = feedbacks.filter((f: any) => f.rating === rating).length;
                      const percentage = Math.round((count / feedbacks.length) * 100);
                      return (
                        <div key={rating} className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-center mb-2">
                            <span className="text-yellow-400 text-lg">★</span>
                            <span className="text-sm font-medium ml-1">{rating}</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{count}</p>
                          <p className="text-xs text-gray-500">{percentage}%</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-[#19105B] text-white px-4 py-2 rounded-lg">
                      <span className="text-lg">★</span>
                      <span className="font-semibold">
                        {(feedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) / feedbacks.length).toFixed(1)}
                      </span>
                      <span className="text-sm opacity-90">Average Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
      
      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New User</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createUser({
                email: formData.get('email') as string,
                name: formData.get('name') as string,
                password: formData.get('password') as string,
                designation: formData.get('designation') as string || undefined
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input name="email" type="email" required className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input name="name" type="text" required className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input name="password" type="password" required className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Designation (Optional)</label>
                  <input name="designation" type="text" className="w-full p-2 border rounded-md" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowCreateUser(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#19105B] hover:bg-[#19105B]/90 text-white">Create User</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Component Modal */}
      {showAddComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Feature</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createFeature({
                name: formData.get('name') as string,
                description: formData.get('description') as string || undefined
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Feature Name</label>
                  <input name="name" type="text" required className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea name="description" className="w-full p-2 border rounded-md" rows={3}></textarea>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddComponent(false)}>Cancel</Button>
                <Button type="submit">Create Feature</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Model Modal */}
      {showAddModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add New AI Model</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createModel({
                name: formData.get('name') as string,
                description: formData.get('description') as string || undefined
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Model Name</label>
                  <input name="name" type="text" required className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea name="description" className="w-full p-2 border rounded-md" rows={3}></textarea>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddModel(false)}>Cancel</Button>
                <Button type="submit">Create Model</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create System Workspace Modal */}
      {showCreateWorkspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create System Workspace</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              try {
                
                await axios.post(`${import.meta.env.VITE_API_URL}/workspaces/system`, {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string || undefined,
                  preprompt: formData.get('preprompt') as string || undefined,
                  is_private: false
                }, {
                  withCredentials: true
                });
                toast.success("System workspace created");
                setShowCreateWorkspace(false);
                fetchWorkspaces();
              } catch (error: any) {
                toast.error(error.response?.data?.detail || "Failed to create workspace");
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Workspace Name</label>
                  <input name="name" type="text" required className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea name="description" className="w-full p-2 border rounded-md" rows={2}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pre-prompt</label>
                  <textarea name="preprompt" className="w-full p-2 border rounded-md" rows={3} placeholder="You are an AI assistant..."></textarea>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowCreateWorkspace(false)}>Cancel</Button>
                <Button type="submit">Create Workspace</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
