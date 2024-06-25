import React from 'react';
import './ImageSidebar.css';

const ImageSidebar = ({ onSelectImage }) => {
  const imagePairs = [
    { image: '1.png', depthMap: '1_depth.png' },
    { image: '2.jpg', depthMap: '2_depth.png' },
    { image: '3.jpeg', depthMap: '3_depth.png' },
    { image: '4.jpg', depthMap: '4_depth.png' },
    { image: '5.jpg', depthMap: '5_depth.png' },
    { image: '6.jpg', depthMap: '6_depth.png' },
    { image: '7.jpg', depthMap: '7_smoothed.png' },
    { image: '8.jpg', depthMap: '8_depth.png' },
    { image: '9.jpg', depthMap: '9_depth.png' },
    { image: '10.jpg', depthMap: '10_smoothed.png' },
    { image: '11.jpg', depthMap: '11_depth.png' },
    { image: '12.jpg', depthMap: '12_depth.png' },
    { image: '13.jpeg', depthMap: '13_depth.png' },
    { image: '14.jpg', depthMap: 'mapped_woman_w.png' },
    { image: '15.jpeg', depthMap: '15_depth.png' },
    { image: '16.jpg', depthMap: '16_depth.png' },
    // Añade aquí el nombre de todas las imágenes y sus mapas de profundidad en la carpeta img
  ];

  const imagePairsLcm = [
    { image: 'arc.jpeg', depthMap: 'arc_depth_16bit.png' },
    { image: 'butterfly.jpeg', depthMap: 'butterfly_depth_16bit.png' },
    { image: 'portrait_1.jpeg', depthMap: 'portrait_1_depth_16bit.png' },
    { image: 'portrait_2.jpeg', depthMap: 'portrait_2_depth_16bit.png' },
    { image: 'marigold.jpeg', depthMap: 'marigold_depth_16bit.png' },
    { image: 'dog.jpeg', depthMap: 'dog_depth_16bit.png' },
    { image: 'doughnuts.jpeg', depthMap: 'doughnuts_depth_16bit.png' },
    { image: 'house.jpg', depthMap: 'house_depth_16bit.png' },
    { image: 'berries.jpeg', depthMap: 'berries_depth_16bit.png' },
    { image: 'food.jpeg', depthMap: 'food_depth_16bit.png' },
    { image: 'glasses.jpeg', depthMap: 'glasses_depth_16bit.png' },
    { image: 'puzzle.jpeg', depthMap: 'puzzle_depth_16bit.png' },
    { image: 'concert.jpeg', depthMap: 'concert_depth_16bit.png' },
    { image: 'einstein.jpg', depthMap: 'einstein_depth_16bit.png' },
    { image: 'lake.jpeg', depthMap: 'lake_depth_16bit.png' },
    { image: 'cat.jpg', depthMap: 'cat_depth_16bit.png' },
    { image: 'wave.jpeg', depthMap: 'wave_depth_16bit.png' },
    { image: 'surfer.jpeg', depthMap: 'wave_depth_16bit.png' },
    { image: 'pumpkins.jpg', depthMap: 'pumpkins_depth_16bit.png' },

  ];


  return (
    <div className="image-sidebar">
      {imagePairsLcm.map((pair, index) => (
        <img
          key={index}
          src={`/img/lcm/${pair.image}`}
          alt={`Image ${index + 1}`}
          className="sidebar-image"
          onClick={() => { onSelectImage(`/img/lcm/${pair.image}`, `/img/lcm/${pair.depthMap}`); }}
        />
      ))}
    </div>
  );
};

export default ImageSidebar;
