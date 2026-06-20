import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import FeedbackModal from './FeedbackModal';

interface FeedbackSystemProps {
  userId?: string;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ userId }) => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      checkAndShowFeedback();
    }
  }, [userId]);

  const checkAndShowFeedback = async () => {
    try {
      const email = sessionStorage.getItem('email');
      if (!email) return;

      // Check if user has given feedback
      const response = await fetch(`${import.meta.env.VITE_API_URL}/feedback/status`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        
        if (!data.has_feedback) {
          // User hasn't given feedback, check if we should show modal
          const now = new Date().getTime();
          const lastShown = localStorage.getItem('feedback_last_shown');
          
          if (!lastShown) {
            // First time - show immediately
            setTimeout(() => {
              setShowModal(true);
              localStorage.setItem('feedback_last_shown', now.toString());
            }, 2000);
          } else {
            // Check if 3 hours have passed since last shown
            const timeDiff = now - parseInt(lastShown);
            const threeHours = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
            
            if (timeDiff >= threeHours) {
              setTimeout(() => {
                setShowModal(true);
                localStorage.setItem('feedback_last_shown', now.toString());
              }, 2000);
            }
          }
        } else {
          // User has given feedback - clear localStorage and never show again
          localStorage.removeItem('feedback_last_shown');
        }
      }
    } catch (error) {
      console.error('Error checking feedback status:', error);
    }
  };

  const handleSubmitFeedback = async (rating: number, comment: string) => {
    setIsSubmitting(true);
    try {
      const email = sessionStorage.getItem('email');
      if (!email) {
        toast.error('Please log in to submit feedback');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ rating, comment }),
      });

      if (response.ok) {
        toast.success('Thank you for your feedback!');
        setShowModal(false);
        // Clear the 3-hour timer since user gave feedback
        localStorage.removeItem('feedback_last_shown');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FeedbackModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onSubmit={handleSubmitFeedback}
      isSubmitting={isSubmitting}
    />
  );
};

export default FeedbackSystem;
