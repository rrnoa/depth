import React, { useState, useEffect, useContext } from 'react';
import Cropper from 'react-easy-crop';
import "react-easy-crop/react-easy-crop.css";
import './Crop.css';
import getCroppedImg from './lib/cropImage';
import pixelateImg from "./lib/pixelate";
import { ImageContext } from './context/ImageContext';


const Crop = ({ selectedImage, onPixelComplete, setAllColors, setStartX, setStartY, setXBlokcs, setYBlokcs }) => {
  const {blockSize, setBlockSize, xBlocks, setXBlocks, yBlocks, setYBlocks} = useContext(ImageContext);
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [pixelImg, setPixelImg] = useState(null);


  useEffect(() => {
    if (selectedImage) {
      createImage(selectedImage)
        .then(image => {
          // Convert image to data URL
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, image.width, image.height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          setImageSrc(dataUrl);
        })
        .catch(console.error);
    }
  }, [selectedImage]);

  useEffect(() => {
    if (croppedAreaPixels) {
      onCropComplete(null, croppedAreaPixels);
    }
  }, [blockSize]);


  const onCropComplete = async (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      //setCroppedImg(croppedImage);

      const PixelObj = await pixelateImg(croppedImage, xBlocks, yBlocks, blockSize);
      onPixelComplete(PixelObj.imageURL);

      setAllColors(PixelObj.allColors);
      setXBlokcs(PixelObj.xBlocks);
      setYBlokcs(PixelObj.yBlocks);
      setStartX(croppedAreaPixels.x);
      setStartY(croppedAreaPixels.y);
            
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

   return (
    <div className="new-screen-container">
      <div className="main-area">
        {imageSrc  && (
          <Cropper
          image={imageSrc }
          crop={crop}
          zoom={zoom}
          aspect={xBlocks / yBlocks}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
        )}
      </div>
      <div className="bottom-section">
        <div className="input-group">
          <label htmlFor="width">Ancho:</label>
          <input
            type="number"
            value={xBlocks}
            onChange={(e) => setXBlocks(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="height">Largo:</label>
          <input
            type="number"            
            value={yBlocks}
            onChange={(e) => setYBlocks(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="height">Ancho del bloque</label>
          <select
            value={blockSize}
            onChange={(e) => setBlockSize(Number(e.target.value))}
          >
            <option value={1}>1</option>
            <option value={0.5}>0.5</option>
          </select>
        </div>        
      </div>
    </div>
  );
};

export default Crop;

async function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}
