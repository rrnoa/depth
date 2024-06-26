import { useEffect } from 'react';
import Painter from './Painter';
import ImageContextProvider from './context/ImageContext';

const Main = () => {
    /* useEffect(()=>{
      const script = document.createElement('script');

      script.src = "/js/opencv.js";
          script.async = true;
          script.onload = () => {
              cv['onRuntimeInitialized'] = () => {
                console.log('OpenCV.js is ready.');                
              };
            };
      
          document.body.appendChild(script);   
    },[]) */
    return (
      <ImageContextProvider>
        <Painter />
      </ImageContextProvider>
      );
};

export default Main;