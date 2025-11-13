import React from 'react';
import { useMediaQuery } from 'react-responsive';


const MediaQueryImage: React.FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const getImageProps = () => {
    if (isMobile) {
      return {
        src: '/images/back.jpg',
        height: '200px'
      };
    } else if (isTablet) {
      return {
        src: '/images/back.jpg',
        height: '300px'
      };
    } else if(isDesktop){
      return {
        src: '/images/back.jpg',
        height: '400px'
      };
    }else {
      return {
        src: '/images/back.jpg',
        height: '400px'
      };
    }
  };

  const { src, height } = getImageProps();

  return (
    <img 
      src={src}
      alt="Responsive"
      style={{
        width: '100%',
        height: height,
        objectFit: 'cover'
      }}
    />
  );
};

export default MediaQueryImage;