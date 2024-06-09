import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { configCamera, configLights, configRender, configControls } from './three-setup';
import { FilterLogaritm } from '../lib/FilterLogaritm';


export const Paint3d = ({ sceneRef, renderRef, heights, allColors, xBlocks, yBlocks }) => {
    const blockSizeInInches = 1;
    const [maxScaleFactor, setMaxScaleFactor] = useState(10);
    const [applyLogaritm, setApplyLogaritm] = useState(false);
    const [applyScale, setApplyScale] = useState(true);
    const [cutHeight, setCutHeight] = useState(0.65);
    const canvasRef = useRef(null);
    const guiRef = useRef(null);

    useEffect(() => {
        if (!guiRef.current) {
            guiRef.current = new GUI();
            const heightCutController = guiRef.current.add({ cutHeight }, 'cutHeight', 0, 1, 0.01);
            const maxScaleFactorController = guiRef.current.add({ maxScaleFactor }, 'maxScaleFactor', 1, 50, 1);
            const applyLogaritmController = guiRef.current.add({ applyLogaritm }, 'applyLogaritm');
            const applyScaleController = guiRef.current.add({ applyScale }, 'applyScale');
            guiRef.current.add({ applyChanges: () => applyChanges(heightCutController, maxScaleFactorController, applyLogaritmController, applyScaleController) }, 'applyChanges');
        }

        console.log("----------------------useEffect Scene3d----------------------------");

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

        paintRelive(sceneRef, heights, allColors, xBlocks, yBlocks, cutHeight, blockSizeInInches, maxScaleFactor, applyLogaritm, applyScale);

        return () => {
            console.log("desmontando");
            removeMeshesWithChildren(sceneRef);
            if (guiRef.current) {
                guiRef.current.destroy();
                guiRef.current = null;
            }
        };
    }, [heights, cutHeight, maxScaleFactor, applyLogaritm, applyScale]);

    const applyChanges = (heightCutController, maxScaleFactorController, applyLogaritmController, applyScaleController) => {
        console.log("aplicando cambios...");
        setCutHeight(heightCutController.getValue());
        setMaxScaleFactor(maxScaleFactorController.getValue());
        setApplyLogaritm(applyLogaritmController.getValue());
        setApplyScale(applyScaleController.getValue());
        console.log(applyScaleController.getValue());
    };

    return (
        <>
            <div style={{position: 'fixed', top: '42px', color:'black'}}>Dimensiones: {xBlocks}x{yBlocks}</div>
            <div ref={canvasRef} style={{ width: '100%', height: '100%'}}></div>
        </>
       
    );
};

const paintRelive = (scene, alturas, allColors, xBlocks, yBlocks, cutHeight, blockSizeInInches, maxScaleFactor, applyLogaritm, applyScale) => {
    blockSizeInInches = blockSizeInInches * 0.0254;
    maxScaleFactor = maxScaleFactor * 0.0254;

    let heights = [...alturas];//copiar el arreglo de alturas
    let depthMin = Math.min(...heights);
    let depthMax = Math.max(...heights);  

    console.log("----------------------",depthMin,depthMax)

    //invertir alturas 

    for (let index = 0; index < heights.length; index++) {
        heights[index] = depthMax - heights[index];        
    }

    //recortar las alturas
    for (let index = 0; index < heights.length; index++) {
        if ( heights[index] < cutHeight * depthMax) {
            heights[index] = cutHeight * depthMax;
        } else {
           console.log("Umbral")
        }
        
       
    }

    if(applyLogaritm) {
        console.log("aplicando logaritmo")
        FilterLogaritm(heights, 0, maxScaleFactor);
    } else if(applyScale) {
        console.log("aplicando Escala")
        depthMin = Math.min(...heights);
        depthMax = Math.max(...heights);
        for (let i = 0; i < heights.length; i++) {
            heights[i] = maxScaleFactor * (heights[i] - depthMin) / (depthMax - depthMin);
        }
    } else {
        console.log("Aplicando Escala normal")
        for (let index = 0; index < heights.length; index++) {
            heights[index] = (depthMax - heights[index]) * 0.004;
        }
    }

    const scaledMaxHeight = Math.max(...heights);//maxima altura despues de scalada
    const scaledMinHeight = Math.min(...heights);//minima altura despues de scalada
    let material;

    console.log("Max minimo", Math.min(...heights), Math.max(...heights));

    for (let j = 0; j < yBlocks; j++) {
        for (let i = 0; i < xBlocks; i++) {

            const height = heights[j * xBlocks + i];
            const geometry = new THREE.BoxGeometry(blockSizeInInches, blockSizeInInches, height);
            if (allColors) {
                const color = `rgb(${allColors[j * xBlocks + i].join(",")})`;
                material = new THREE.MeshStandardMaterial({ color: color });
            } else {
                material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            }

            const cube = new THREE.Mesh(geometry, material);
            cube.castShadow = true;
            cube.receiveShadow = true;
            cube.position.set(i * blockSizeInInches - xBlocks * blockSizeInInches / 2, (yBlocks - j - 1) * blockSizeInInches - yBlocks * blockSizeInInches / 2, height / 2);
            scene.add(cube);
        }
    }
    const refgeometry = new THREE.BoxGeometry(0.0254, 0.0254, 0.254);
    const refMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const refMesh = new THREE.Mesh(refgeometry, refMaterial);
    const axesHelper = new THREE.AxesHelper( 1 );
    //scene.add( axesHelper );
    console.log("depthMin-------------",depthMin)
    refMesh.translateZ(0.254/2);
    scene.add(refMesh);
};


const removeMeshesWithChildren = (obj) => {
    const children = [...obj.children];
    for (const child of children) {
        if (child instanceof THREE.Mesh) {
            removeMeshesWithChildren(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    for (const material of child.material) {
                        if (material.map) material.map.dispose();
                        if (material.metalnessMap) material.metalnessMap.dispose();
                        if (material.normalMap) material.normalMap.dispose();
                        material.dispose();
                    }
                } else {
                    if (child.material.map) child.material.map.dispose();
                    if (child.material.metalnessMap) child.material.metalnessMap.dispose();
                    if (child.material.normalMap) child.material.normalMap.dispose();
                    child.material.dispose();
                }
            }
            obj.remove(child);
        }
    }
};
