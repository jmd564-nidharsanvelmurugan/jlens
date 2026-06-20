import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  isSubmitting?: boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, comment);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] animate-in fade-in duration-300">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 relative z-[10000]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#19105B]">Share Your Feedback</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Help us improve JLens! Your feedback helps us build a better experience.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#19105B] mb-3 text-center">
              How would you rate JLens? <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2 justify-center mb-3 p-3 bg-gradient-to-r from-[#19105B]/5 to-[#A16BDB]/5 rounded-lg border border-[#19105B]/20">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#A16BDB] rounded-full"
                  disabled={isSubmitting}
                >
                  <span
                    className={`text-2xl cursor-pointer transition-all duration-200 ${
                      star <= (hoveredRating || rating)
                        ? 'text-[#A16BDB] drop-shadow-sm'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm font-medium text-[#A16BDB] mb-2">
                You rated: {rating}/5 stars
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#19105B] mb-2">
              Tell us more (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like? What could be improved?"
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-[#A16BDB] focus:border-[#A16BDB] resize-none text-sm"
              rows={3}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {comment.length}/1000 characters
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="flex-1 px-4 py-2 bg-[#19105B] text-white rounded-md text-sm font-medium hover:bg-[#19105B]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default FeedbackModal;
