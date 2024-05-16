import React, { useState, useEffect, useRef } from 'react';
import './App.css'
import initThreeJS from './components/Init3d';
import pixelateImg from "./lib/pixelate";
import ToggleVMState from './components/ChangeVMState';

function App() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [pixelImageUrl, setPixelImageUrl] = useState(null);
  const [pixelDepthUrl, setPixelDepthUrl] = useState(null);
  const [heights, setHeights] = useState([]);
  const [allColors, setAllColors] = useState([]);

  const xBlocks = 90;
  const yBlocks = 90 ;

  const canvasRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    setImage(file);
    setImageUrl(URL.createObjectURL(file));  // Crear una URL temporal para la imagen original
    const PixelOrigen = await pixelateImg(URL.createObjectURL(file), xBlocks, yBlocks);
    setAllColors(PixelOrigen.allColors);
    setPixelImageUrl(PixelOrigen.imageURL)
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!image) return;

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('http://149.36.1.177:5000/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTaskId(data.task_id);
      setStatus('PENDING');
      checkStatus(data.task_id);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const checkStatus = async (taskId) => {
    let intervalId = setInterval(async () => {
      const response = await fetch(`http://149.36.1.177:5000/status/${taskId}`);
      const data = await response.json();
      setStatus(data.state);

      if (data.state === 'SUCCESS') {
        let resultUrl = `http://149.36.1.177:5000/result/${taskId}`;
        setResultImageUrl(resultUrl); 
        pixelateImageLegacy(resultUrl, 5, (alturas) => {
          console.log(alturas);
          setHeights(alturas);
          initThreeJS(canvasRef.current, alturas, allColors, xBlocks, yBlocks);
        });       
        clearInterval(intervalId);
      } else if (data.state === 'FAILURE') {
        setStatus('FAILED');
        clearInterval(intervalId);
      }
    }, 5000); // Consultar cada 5 segundos
  };



  return (
    <div className="App"> 
      <div>
        <div>Cambiar Estado de Máquina Virtual</div>
        <ToggleVMState />
      </div>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <button type="submit">Submit</button>
      </form>
      {status && <p>Status: {status}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
        {imageUrl && (
          <div>
            <h2>Original Image</h2>
            <img src={imageUrl} alt="Original" style={{ maxWidth: '300px', maxHeight: '300px' }} />
          </div>
        )}
        {pixelImageUrl && (
          <div>
            <h2>Pixel Image</h2>
            <img src={pixelImageUrl} alt="Original" style={{ maxWidth: '300px', maxHeight: '300px' }} />
          </div>
        )}
        {resultImageUrl && (
          <div>
            <h2>Inference Result</h2>
            <img src={resultImageUrl} alt="Result" style={{ maxWidth: '300px', maxHeight: '300px' }} />
          </div>
        )}        
      </div>
      <div>
        <h2>Relieve</h2>
        <div ref={canvasRef}></div>
      </div>
    </div>
  );
}

function pixelateImageLegacy(sourceImage, pixelSize, callback) {
  const img = new Image();
  img.crossOrigin = 'Anonymous'; // Esto es útil si la imagen está en un dominio diferente
  img.src = sourceImage;

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Ajustar el tamaño del canvas al tamaño reducido
    const newWidth = img.width / pixelSize;
    const newHeight = img.height / pixelSize;
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Dibujar la imagen reducida en el canvas
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Crear un segundo canvas para escalar de vuelta a tamaño original
    const canvasGrande = document.createElement('canvas');
    const ctxGrande = canvasGrande.getContext('2d');
    canvasGrande.width = img.width;
    canvasGrande.height = img.height;
    ctxGrande.imageSmoothingEnabled = false; // Deshabilitar suavizado para efecto pixelado

    // Dibujar la imagen pixelada en el canvas grande
    ctxGrande.drawImage(canvas, 0, 0, newWidth, newHeight, 0, 0, img.width, img.height);

    // Convertir el canvas a una URL de imagen
    const pixelatedImageUrl = canvasGrande.toDataURL();

    // Extraer los datos de píxeles de la imagen reducida
    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const alturas = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Obtener solo los valores RGB de cada píxel
      alturas.push(imageData.data[i]);
    }
    callback(alturas, pixelatedImageUrl);
  };

  img.onerror = (error) => {
    console.error('Error loading image:', error);
    callback(null, null, error);
  };
}

export default App
