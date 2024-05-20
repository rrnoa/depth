import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { configCamera, configLights, configRender, configControls } from './three-setup';
import { FilterLogaritm } from '../lib/FilterLogaritm';

export const Paint3d = ({ sceneRef, renderRef, heights, allColors, xBlocks, yBlocks }) => {
    const [blockSizeInInches, setBlockSizeInInches] = useState(1);
    const [maxScaleFactor, setMaxScaleFactor] = useState(10);
    const [applyLogaritm, setApplyLogaritm] = useState(false);
    const canvasRef = useRef(null);
    const guiRef = useRef(null);

    useEffect(() => {
        if (!guiRef.current) {
            guiRef.current = new GUI();
            const blockSizeController = guiRef.current.add({ blockSizeInInches }, 'blockSizeInInches', 0.5, 3, 0.5);
            const maxScaleFactorController = guiRef.current.add({ maxScaleFactor }, 'maxScaleFactor', 1, 50, 1);
            const applyLogaritmController = guiRef.current.add({ applyLogaritm }, 'applyLogaritm');
            guiRef.current.add({ applyChanges: () => applyChanges(blockSizeController, maxScaleFactorController) }, 'applyChanges');
        }

        console.log("----------------------useEffect Scene3d----------------------------");

        const width = window.innerWidth;
        const height = window.innerHeight;

        configRender(renderRef, canvasRef.current, width, height);
        const camera = configCamera(width, height);
        const directionalLight = configLights();
        const controls = configControls(camera, renderRef);
        const ambientlight = new THREE.AmbientLight(0xffffff, 1);
        let shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        const helper = new THREE.DirectionalLightHelper(directionalLight, 5);

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

        paintRelive(sceneRef, heights, allColors, xBlocks, yBlocks, blockSizeInInches, maxScaleFactor);

        return () => {
            console.log("desmontando");
            removeMeshesWithChildren(sceneRef);
            if (guiRef.current) {
                guiRef.current.destroy();
                guiRef.current = null;
            }
        };
    }, [heights, blockSizeInInches, maxScaleFactor]);

    const applyChanges = (blockSizeController, maxScaleFactorController) => {
        console.log("aplicando cambios...");
        setBlockSizeInInches(blockSizeController.getValue());
        setMaxScaleFactor(maxScaleFactorController.getValue());
    };

    return (
        <>
            <div style={{position: 'fixed', top: '10px'}}>Dimensiones: {xBlocks}x{yBlocks}</div>
            <div ref={canvasRef} style={{ width: '100%', height: '100%' }}>Paint3d</div>
        </>
       
    );
};

const paintRelive = (scene, heights, allColors, xBlocks, yBlocks, blockSizeInInches, maxScaleFactor) => {
    blockSizeInInches = blockSizeInInches * 0.0254;
    maxScaleFactor = maxScaleFactor * 0.0254;
    const maxHeight = 0.254; // Establece un tope máximo de altura en pulgadas
    let mayor = 0;
    const normalizedHeights = heights.map(height => {
        let adjustedHeight = maxScaleFactor - (height * (maxScaleFactor / 255));
        return adjustedHeight;
    });

    //FilterLogaritm(heights, 0, maxHeight);
    console.log(heights);   

    let material;

    for (let j = 0; j < yBlocks; j++) {
        for (let i = 0; i < xBlocks; i++) {
            const height = normalizedHeights[j * xBlocks + i];
            //const height = maxHeight - heights[j * xBlocks + i];
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
