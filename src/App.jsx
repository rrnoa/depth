import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { FaUpload, FaCheck } from 'react-icons/fa';
import pixelateImg from "./lib/pixelate";
//import { pixelateImageLegacy } from './lib/pixelateLegazy';
import { pixelate16 } from './lib/pixel16';
import './App.css';
import { Paint3d } from './components/Paint3d';

const App = () => {
  const sceneRef = useRef(new THREE.Scene());
  const renderRef =  useRef(new THREE.WebGLRenderer({ antialias: true}));

  const [imageUrl, setImageUrl] = useState(null);
  const [pixelImageUrl, setPixelImageUrl] = useState(null);
  const [dpi, setDpi] = useState(72/2);
  const [pixelDepthUrl, setPixelDepthUrl] = useState(null);
  const [heights, setHeights] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [xBlocks, setXBlocks] = useState(0);
  const [yBlocks, setYBlocks] = useState(0);
  const [resultImageUrl, setResultImageUrl] = useState(null);

  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');


  

  const handleImageUpload = (e, setImageUrl) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setImageUrl(reader.result);
        const PixelOrigen = await pixelateImg(reader.result, 1, dpi);
        setXBlocks(PixelOrigen.xBlocks);
        setYBlocks(PixelOrigen.yBlocks);
        setAllColors(PixelOrigen.allColors);
        setPixelImageUrl(PixelOrigen.imageURL);  
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMapUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        const arrayBuffer = e.target.result;
        pixelate16(arrayBuffer, pixelImageUrl, 1, dpi, xBlocks, yBlocks, (dataUrl, alturas)=>{
          setPixelDepthUrl(dataUrl);
          setHeights(alturas);
          
        })
      };
      reader.readAsArrayBuffer(file);

      const reader2 = new FileReader();
      reader2.onloadend = async () => {
        setResultImageUrl(reader2.result);
      };
      reader2.readAsDataURL(file);

    }
  };

  return (
    <div className="app-container">
      <div className={`sidebar`}>
        <div className="upload-section">
          <input type="file" id="image1" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, setImageUrl)} />
          <label htmlFor="image1" className="upload-button">
            <FaUpload /> Imagen
          </label>
          {imageUrl && <img src={imageUrl} alt="Preview 1" className="preview-image" />}
        </div>
        <div className="upload-section">
          <input type="file" id="image2" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleMapUpload(e)} />
          <label htmlFor="image2" className="upload-button">
            <FaUpload /> Profundidad
          </label>
          {resultImageUrl && <img src={resultImageUrl} alt="Preview 2" className="preview-image" />}
        </div>
        <div className="dimension-inputs">
          <label style={{color: 'black'}}>Dimensiones:</label>
          <div className="input-group">
            <input
              type="number"
              placeholder="Largo"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
            <input
              type="number"
              placeholder="Ancho"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>
        </div>
        <button className="process-button">
          <FaCheck /> Process
        </button>
      </div>
      <div className="canvas-container">
        <div id="mainCanvas">
        <Paint3d 
          sceneRef = {sceneRef.current}
          renderRef = {renderRef.current}
          heights = {heights}
          allColors = {allColors}
          xBlocks = {xBlocks}
          yBlocks = {yBlocks}
        ></Paint3d>
        </div>
      </div>
      <div className="rightbar">
        <div className="image-section">
        {pixelImageUrl && <img src={pixelImageUrl} alt="Pixelada" className="rightbar-image" />}
          <p>Pixelada</p>
        </div>
        <div className="image-section">
          {pixelDepthUrl && <img src={pixelDepthUrl} alt="Mapa Pixelado" className="rightbar-image" />}
          <p>Mapa Pixelado</p>
        </div>
      </div>
    </div>
  );
};

export default App;
