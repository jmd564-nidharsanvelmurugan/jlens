import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useAutoSendMessage(
  conversationId: string | undefined,
  handleSendRef: React.MutableRefObject<(text: string) => void>
) {
  const location = useLocation();
  const navigate = useNavigate();

  const [initialAutoSendMessage] = useState(() => location.state?.autoSendMessage);
  const hasSent = useRef(false);

  useEffect(() => {
    if (location.state?.autoSendMessage) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!hasSent.current && initialAutoSendMessage && conversationId) {
      hasSent.current = true;
      handleSendRef.current(initialAutoSendMessage);
    }
  }, [initialAutoSendMessage, conversationId, handleSendRef]);
}
