import {createContext, useState} from "react"

export const ImageContext = createContext();

const ImageContextProvider = ({children}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [xBlocks, setXBlocks] = useState(50);
  const [yBlocks, setYBlocks] = useState(50);
  const [blockSize, setBlockSize] = useState(0.5);


  const data = {
    xBlocks, setXBlocks,
    yBlocks, setYBlocks,
    selectedImage, setSelectedImage,
    croppedImage, setCroppedImage,
    croppedAreaPixels, setCroppedAreaPixels,
    blockSize, setBlockSize
  }

  return ( 
    <ImageContext.Provider value={data}>
        {children}
    </ImageContext.Provider>   
  )
}

export default ImageContextProvider
