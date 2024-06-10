import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import "react-easy-crop/react-easy-crop.css";
import { useNavigate } from 'react-router-dom';
import './Crop.css';
import getCroppedImg from './lib/cropImage';
import pixelateImg from "./lib/pixelate";



const Crop = () => {
  const [width, setWidth] = useState(80);
  const [height, setHeight] = useState(50);
  const [blockSize, setBlockSize] = useState(1);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImg, setCroppedImg] = useState(null);


  const navigate = useNavigate();

  const onCropComplete =  async (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    setCroppedImg(croppedImage);
  }

  const handleContinue = async () => {
    // Handle the continue button click, maybe you want to pass the cropped area details
    const PixelObj = await pixelateImg(croppedImg, width, height, blockSize);
    const allColors = PixelObj.allColors;
    const pxImg = PixelObj.imageURL;
    const xBlocks = PixelObj.xBlocks;
    const yBlocks = PixelObj.yBlocks;
    const startX = croppedAreaPixels.x;
    const startY = croppedAreaPixels.y;
    navigate('/app', { state: { width, height, blockSize, croppedImg, pxImg, xBlocks, yBlocks, allColors, startX, startY } });   
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', () => setImageSrc(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="new-screen-container">
      <div className="main-area">
        {imageSrc ? (
          <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={width / height}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
        ) : (
          <input type="file" onChange={handleFileChange} />
        )}
      </div>
      <div className="bottom-section">
        <div className="input-group">
          <label htmlFor="width">Ancho:</label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="height">Largo:</label>
          <input
            type="number"            
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="height">Ancho del bloque</label>
          <input
            type="number"            
            value={blockSize}
            onChange={(e) => setBlockSize(e.target.value)}
          />
        </div>
        <button className="continue-button" onClick={handleContinue}>
          Continuar
        </button>
      </div>
    </div>
  );
};

export default Crop;
