import { createContext, useContext, useState } from "react";

const SidebarContext = createContext({} as SidebarContextType);

export type SidebarContextType = {
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SidebarProvider({children}: {children: React.ReactNode}) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <SidebarContext.Provider value={{isSidebarCollapsed, setIsSidebarCollapsed}}>
            {children}
        </SidebarContext.Provider>
    )
}

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('SidebarContext must be used within a SidebarProvider');
  }
  return context;
}
