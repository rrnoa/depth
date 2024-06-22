import React, { useState, useEffect, useRef, useContext } from 'react';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { configCamera, configLights, configRender, configControls } from './three-setup';
import { escalarPulgadas, smoothHeightMap } from '../lib/Filters';
import { ImageContext } from '../context/ImageContext';

export const Paint3d = ({ sceneRef, renderRef, heights, allColors, xBlocks, yBlocks }) => {
    const {blockSize} = useContext(ImageContext);
    const [maxScaleFactor, setMaxScaleFactor] = useState(5);
    const [showGreen, setShowGreen] = useState(false);
    const [cutHeight, setCutHeight] = useState(0.5);
    const [delta, setDelta] = useState(0.125);
    const canvasRef = useRef(null);
    const guiRef = useRef(null);

    useEffect(() => {
        if (!guiRef.current) {
            guiRef.current = new GUI();
            const heightCutController = guiRef.current.add({ cutHeight }, 'cutHeight', 0, 1, 0.01);
            const maxScaleFactorController = guiRef.current.add({ maxScaleFactor }, 'maxScaleFactor', 1, 50, 1);
            const deltaController = guiRef.current.add({ delta }, 'delta', [0.125, 0.25, 0.5, 1]);
            const showGreenController = guiRef.current.add({ showGreen }, 'showGreen');
            guiRef.current.add({ applyChanges: () => applyChanges(heightCutController, maxScaleFactorController, deltaController, showGreenController) }, 'applyChanges');
        }

        /* const width = window.innerWidth;
        const height = window.innerHeight; */
        const width = canvasRef.current?.offsetWidth;
		const height = canvasRef.current?.offsetHeight;

        configRender(renderRef, canvasRef.current, width, height);
        const camera = configCamera(width, height);
        const directionalLight = configLights();
        const controls = configControls(camera, renderRef);
        const ambientlight = new THREE.AmbientLight(0xffffff, 1);
        let shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        const helper = new THREE.DirectionalLightHelper(directionalLight, 5);

        sceneRef.background = new THREE.Color( 0xFBFBFC );

        sceneRef.add(helper);
        sceneRef.add(shadowHelper);
        sceneRef.add(ambientlight);
        sceneRef.add(directionalLight);

        const animate = function () {
            requestAnimationFrame(animate);
            controls.update();
            renderRef.render(sceneRef, camera);
        };

        animate();

        paintRelive(sceneRef, heights, allColors, xBlocks, yBlocks, cutHeight, blockSize, maxScaleFactor, delta, showGreen);

        return () => {
            console.log("desmontando");
            removeObjWithChildren(sceneRef);
            if (guiRef.current) {
                guiRef.current.destroy();
                guiRef.current = null;
            }
        };
    }, [heights, cutHeight, maxScaleFactor, delta, showGreen]);

    const applyChanges = (heightCutController, maxScaleFactorController, deltaController, showGreenController) => {
        console.log("aplicando cambios...");
        setCutHeight(heightCutController.getValue());
        setMaxScaleFactor(maxScaleFactorController.getValue());        
        setDelta(deltaController.getValue());
        setShowGreen(showGreenController.getValue());
    };

    return (
        <>
            <div style={{position: 'fixed', top: '70px', color:'black'}}>Dimensiones: {xBlocks*blockSize}x{yBlocks*blockSize}---{blockSize}</div>
            <div ref={canvasRef} style={{ width: '70vw', height: '80vh', backgroundColor:'red'}}></div>
        </>
       
    );
};

const paintRelive = (scene, alturas, allColors, xBlocks, yBlocks, cutHeight, blockSize, maxScaleFactor, delta, showGreen) => {
    blockSize = blockSize * 0.0254;
    maxScaleFactor = maxScaleFactor * 0.0254;
    delta = delta * 0.0254;

    let heights = [...alturas];//copiar el arreglo de alturas
    let depthMin = Math.min(...heights);
    let depthMax = Math.max(...heights);  

    //invertir alturas 

    for (let index = 0; index < heights.length; index++) {
        heights[index] = depthMax - heights[index];        
    }

    //recortar las alturas
    for (let index = 0; index < heights.length; index++) {
        if ( heights[index] < cutHeight * depthMax) {
            heights[index] = cutHeight * depthMax;
        }       
    }
    
    depthMin = Math.min(...heights);
    depthMax = Math.max(...heights);
    console.log("despues del corte", Math.min(...heights), Math.max(...heights));

    //Llevarlo a que quepa en 10 pulgadas. Me dice que parte de las 10 pulgadas representa cada altura
    //(heights[i] - depthMin) / (depthMax - depthMin); me da un valor de 0-1
    //en definitiva me devuelve alturas entre 0 y 0.254/2 (estamos usando 5 pulgadas) 
    for (let i = 0; i < heights.length; i++) {
        heights[i] = maxScaleFactor * (heights[i] - depthMin) / (depthMax - depthMin);
        if(heights[i] == 0) heights[i] = 0.0254/2 // que el fondo se de media pulgada minimo
    }

    console.log("despues de llevadas a pulgadas", Math.min(...heights), Math.max(...heights));
   
    //heights = smoothHeightMap(heights, xBlocks, yBlocks, 0.0254)
    
    heights = escalarPulgadas(heights, maxScaleFactor, delta);

    console.log(Math.min(...heights), Math.max(...heights), heights.length, xBlocks, yBlocks);

    // Crear la geometría y material que se reutilizarán
    const geometry = new THREE.BoxGeometry(blockSize, blockSize, 1);
    let material;
    if (allColors) {
        material = new THREE.MeshStandardMaterial();
    } else {
        material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    }

    // Crear el InstancedMesh con el número total de instancias
    const count = xBlocks * yBlocks;
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

    // Añadir sombras si es necesario
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    let instanceIndex = 0;
    for (let j = 0; j < yBlocks; j++) {
        for (let i = 0; i < xBlocks; i++) {
            const height = heights[j * xBlocks + i];

            // Si hay colores especificados, actualizar el material
            if (allColors) {
                const color = new THREE.Color(`rgb(${allColors[j * xBlocks + i].join(",")})`);
                instancedMesh.setColorAt(instanceIndex, color);
            }

            // Crear la matriz de transformación
            const matrix = new THREE.Matrix4();
            matrix.compose(
                new THREE.Vector3(
                    i * blockSize - xBlocks * blockSize / 2,
                    (yBlocks - j - 1) * blockSize - yBlocks * blockSize / 2,
                    height / 2
                ),
                new THREE.Quaternion(),
                new THREE.Vector3(1, 1, height) // Escalar en el eje Z
            );

            // Establecer la matriz de transformación para esta instancia
            instancedMesh.setMatrixAt(instanceIndex, matrix);
            instanceIndex++;
        }
    }

    // Añadir el InstancedMesh a la escena
    scene.add(instancedMesh);

    if(showGreen) {
        const refgeometry = new THREE.BoxGeometry(0.0254, 0.0254, 0.254);
        const refMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const refMesh = new THREE.Mesh(refgeometry, refMaterial);
        refMesh.translateZ(0.254/2);
        scene.add(refMesh);
    }
   
};

const removeObjWithChildren = (obj) => {
    while (obj.children.length > 0) {
      removeObjWithChildren(obj.children[0]);
    }
    if (obj.geometry) {
      obj.geometry.dispose();

    }
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        for (const material of obj.material) {
          if (material.map) {
            material.map.dispose();
            //console.log('eliminando texturas');
          }
          if (material.metalnessMap) {
            material.metalnessMap.dispose();
            //console.log('eliminando texturas');
          }
          if (material.normalMap) {
            material.normalMap.dispose();
            //console.log('eliminando texturas');
          }
          material.dispose();
            //console.log('eliminando materiales');
        }
      } else {
        if (obj.material.map) {
          obj.material.map.dispose();
        }
        if (obj.material.metalnessMap) {
            obj.material.metalnessMap.dispose();
        }
        if (obj.material.normalMap) {
            obj.material.normalMap.dispose();
        }
        obj.material.dispose();
      }
    }
    if (obj.parent) {
      obj.parent.remove(obj);
    }
}

