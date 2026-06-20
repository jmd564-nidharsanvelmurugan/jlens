import React from 'react';
import { MessageSquare, X } from 'lucide-react';

interface FeedbackBannerProps {
  onFeedbackClick: () => void;
  onDismiss?: () => void;
}

const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ onFeedbackClick, onDismiss }) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              Help us improve JLens! Share your feedback and help us build a better experience.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onFeedbackClick}
            className="bg-white text-purple-600 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors flex-shrink-0"
          >
            Give Feedback
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-purple-200 hover:text-white transition-colors p-1"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackBanner;
