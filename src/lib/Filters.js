export const escalarPulgadas = (alturas, rango, delta) => {
    const scala = [];
    for (let index = delta; index <= rango; index+=delta) {
        scala.push(index);
    }

    return scaleDepthValues(alturas, scala);

}

function scaleDepthValues(depthMap, targetRanges) {
    const scaledDepthMap = depthMap.map(value => {
      // Encontrar el rango más cercano al valor actual
      let closestRange = targetRanges[0];
      let minDiff = Math.abs(value - closestRange);
  
      for (let i = 1; i < targetRanges.length; i++) {
        const diff = Math.abs(value - targetRanges[i]);
        if (diff < minDiff) {
          closestRange = targetRanges[i];
          minDiff = diff;
        }
      }
  
      return closestRange;
    });

    return scaledDepthMap;
  }  

  export function smoothHeightMap(heightMap, width, height, radius) {
    const smoothedHeightMap = [...heightMap];
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;
  
        for (let ry = -radius; ry <= radius; ry++) {
          const ny = y + ry;
          if (ny >= 0 && ny < height) {
            for (let rx = -radius; rx <= radius; rx++) {
              const nx = x + rx;
              if (nx >= 0 && nx < width) {
                const neighborIdx = ny * width + nx;
                sum += heightMap[neighborIdx];
                count++;
              }
            }
          }
        }
  
        const currentIdx = y * width + x;
        smoothedHeightMap[currentIdx] = sum / count;
      }
    }
  
    return smoothedHeightMap;
  } 

  export function contornos(heightMap, width, height, precision) {
    const contourMask = new Array(height * width).fill(false);
    // Paso 1: Identificar contornos
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currentIdx = y * width + x;
        const currentHeight = heightMap[currentIdx];
  
        for (let ry = -1; ry <= 1; ry++) {
          const ny = y + ry;
          if (ny >= 0 && ny < height) {
            for (let rx = -1; rx <= 1; rx++) {
              const nx = x + rx;
              if (nx >= 0 && nx < width) {
                const neighborIdx = ny * width + nx;
                const neighborHeight = heightMap[neighborIdx];
  
                if ((currentHeight - neighborHeight) > precision) {
                  contourMask[currentIdx] = true;
                  break;
                }
              }
            }
          }
        }
      }
    }

    return contourMask;
  }
  
  export function smoothHeightMapContours(heightMap, width, height, radius, precision) {
    const smoothedHeightMap = [...heightMap];
    const contourMask = new Array(height * width).fill(false);
  
    // Paso 1: Identificar contornos
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currentIdx = y * width + x;
        const currentHeight = heightMap[currentIdx];
  
        for (let ry = -1; ry <= 1; ry++) {
          const ny = y + ry;
          if (ny >= 0 && ny < height) {
            for (let rx = -1; rx <= 1; rx++) {
              const nx = x + rx;
              if (nx >= 0 && nx < width) {
                const neighborIdx = ny * width + nx;
                const neighborHeight = heightMap[neighborIdx];
  
                if (Math.abs(currentHeight - neighborHeight) > precision) {
                  contourMask[currentIdx] = true;
                  break;
                }
              }
            }
          }
        }
      }
    }
  
    // Paso 2: Aplicar suavizado solo en contornos
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!contourMask[y * width + x]) {
          continue;
        }
  
        let sum = 0;
        let count = 0;
  
        for (let ry = -radius; ry <= radius; ry++) {
          const ny = y + ry;
          if (ny >= 0 && ny < height) {
            for (let rx = -radius; rx <= radius; rx++) {
              const nx = x + rx;
              if (nx >= 0 && nx < width) {
                const neighborIdx = ny * width + nx;
                sum += heightMap[neighborIdx];
                count++;
              }
            }
          }
        }
  
        const currentIdx = y * width + x;
        smoothedHeightMap[currentIdx] = sum / count;
      }
    }
  
    return smoothedHeightMap;
  }

  export function smoothHeightMapContrast(heightMap, width, height, radius, precision) {
    const smoothedHeightMap = [...heightMap];
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currentIdx = y * width + x;
        const currentHeight = heightMap[currentIdx];
  
        let highContrast = false;
  
        for (let ry = -1; ry <= 1; ry++) {
          const ny = y + ry;
          if (ny >= 0 && ny < height) {
            for (let rx = -1; rx <= 1; rx++) {
              const nx = x + rx;
              if (nx >= 0 && nx < width) {
                const neighborIdx = ny * width + nx;
                const neighborHeight = heightMap[neighborIdx];
  
                if (Math.abs(currentHeight - neighborHeight) > precision) {
                  highContrast = true;
                  break;
                }
              }
            }
          }
          if (highContrast) break;
        }
  
        if (highContrast) {
          let sum = 0;
          let count = 0;
  
          for (let ry = -radius; ry <= radius; ry++) {
            const ny = y + ry;
            if (ny >= 0 && ny < height) {
              for (let rx = -radius; rx <= radius; rx++) {
                const nx = x + rx;
                if (nx >= 0 && nx < width) {
                  const neighborIdx = ny * width + nx;
                  sum += heightMap[neighborIdx];
                  count++;
                }
              }
            }
          }
  
          smoothedHeightMap[currentIdx] = sum / count;
        }
      }
    }
  
    return smoothedHeightMap;
  }
  
  
  
  
  
  
  