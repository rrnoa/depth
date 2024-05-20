export const FilterLogaritm = (alturas, scaleMin = 0 , scaleMax = 10) => {
    const depthMin = Math.min(...alturas);
    const depthMax = Math.max(...alturas);

    console.log("Profundidades>>",depthMax,depthMin);

    //primero escalar de 1 a 2
    for (let i = 0; i < alturas.length; i++) {
        alturas[i] = (alturas[i] - depthMin) / (depthMax - depthMin) + 1;
    }

    console.log("escaladas>>", alturas)
    console.log(Math.max(...alturas), Math.min(...alturas));

    for (let index = 0; index < alturas.length; index++) {
        alturas[index] = alturas[index] !== 0? Math.log(alturas[index]): 0;        
    }

    const logDepthMin = Math.min(...alturas);
    const logDepthMax = Math.max(...alturas);

    for (let i = 0; i < alturas.length; i++) {
        alturas[i] = ((alturas[i] - logDepthMin) / (logDepthMax - logDepthMin)) * (scaleMax - scaleMin) + scaleMin;
    }

    return alturas;
  
}
