import React, { createContext, useContext, useState, useEffect } from "react";
import { useUserAccess } from "../store/user/hooks";
import { getCurrentUser } from "../actions/server-actions";

type User = {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  role: string;
};

type Access = {
  id: string;
  user_id: string;
  component: string;
  component_type: string;
};

type GroupedAccess = {
  models: string[];
  features: string[];
  workspaces: string[];
  datasources: string[];
};

type UserContextType = {
  user: User | null;
  access: GroupedAccess | null;
  isNewUser: boolean;
  setUserData: (user: User) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const groupAccessByType = (accessList: Access[]): GroupedAccess => {
  const grouped: GroupedAccess = {
    models: [],
    features: [],
    workspaces: [],
    datasources: [],
  };

  for (const item of accessList) {
    const key = item.component_type.toLowerCase();
    if (key === "model") grouped.models.push(item.component);
    else if (key === "feature") grouped.features.push(item.component);
    else if (key === "workspace") grouped.workspaces.push(item.component);
    else if (key === "datasource") grouped.datasources.push(item.component);
  }

  return grouped;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<GroupedAccess | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: accessData } = useUserAccess();

  useEffect(() => {
    if (accessData?.length) {
      const grouped = groupAccessByType(accessData);
      setAccess(grouped);
    }
  }, [accessData]);

  useEffect(() => {
    const fetchUserData = async () => {
      const email = sessionStorage.getItem('email');
      if (email && !user && !isLoading) {
        setIsLoading(true);
        try {
          const userData = await getCurrentUser();
          setUserData(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Don't set fallback data - let access object handle permissions
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setUserData = (user: User) => {
    setUser(user);
    try {
      const userCreatedAt = new Date((user as any).created_at || "");
      const now = new Date();
      const hoursDiff = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60);
      setIsNewUser(hoursDiff < 24 && !isNaN(hoursDiff));
    } catch (error) {
      setIsNewUser(false);
    }
  };

  const refreshUser = async () => {
    const email = sessionStorage.getItem('email');
    if (email) {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  return (
    <UserContext.Provider value={{ user, access, isNewUser, setUserData, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used inside UserProvider");
  return ctx;
};
