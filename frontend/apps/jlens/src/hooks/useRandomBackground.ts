import { useMemo } from 'react';

export const useRandomBackground = () => {
  const randomImageIndex = useMemo(() => Math.floor(Math.random() * 5) + 1, []);
  const backgroundImage = `/image${randomImageIndex}.png`;
  
  return backgroundImage;
};
