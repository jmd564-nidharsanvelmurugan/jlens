// App.tsx
import "./App.css";
import { Routers } from "./routes";
import { SSOCallbackHandler } from "@/auth/sso-callback-handler";
import AppTour from "@/components/tour/AppTour";

function App() {
  return (
    <>
      <SSOCallbackHandler />
      <Routers />
      <AppTour />
    </>
   
  );
}

export default App;
