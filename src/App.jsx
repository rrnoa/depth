import Painter from './Painter';
import ImageContextProvider from './context/ImageContext';

const Main = () => {
    return (
      <ImageContextProvider>
        <Painter />
      </ImageContextProvider>
      );
};

export default Main;