import {useFrame, useLoader, useThree} from '@react-three/fiber'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {useEnvironment, useScroll} from '@react-three/drei';
import {useCallback, useLayoutEffect, useMemo, useRef, useState} from "react";
import {gsap} from "gsap";
import {Vector3} from "three";
import {sceneObjects} from "../sceneObjects.js";
import {InteractiveMapObject} from "./InteractiveMapObject.jsx";
import {MotionObjects} from "./MotionObjects.jsx";

let savedCameraPosition = null;
const defaultCameraTarget = new Vector3(0, 0, 0);
const currentCameraTarget = defaultCameraTarget.clone();

let carsMesh = null;

export const Experience = () => {
  const gltf = useLoader(GLTFLoader, './scene.glb');
  const scrollData = useScroll();
  const {camera, gl, scene} = useThree();
  const tl = useRef();
  const parentRef = useRef(gl.domElement.parentNode);
  const [selectedObject, setSelectedObject] = useState();

  const onClick = useCallback((objData) => {
    if (!selectedObject && !savedCameraPosition) {
      savedCameraPosition = camera.position.clone();
    }
    setSelectedObject(objData);
  }, []);

  useFrame((state) => {
    if (!selectedObject && !savedCameraPosition) {
      tl.current.seek(scrollData.offset * tl.current.duration());
    }

    const cameraTarget = selectedObject && selectedObject.cameraTarget ? selectedObject.cameraTarget : defaultCameraTarget;

    const mouseAdjustedCameraTarget = new Vector3(
      cameraTarget.x + state.mouse.x / 5,
      cameraTarget.y + state.mouse.y / 5,
      cameraTarget.z,
    );

    currentCameraTarget.lerp(mouseAdjustedCameraTarget, 0.01);
    camera.lookAt(currentCameraTarget);

    if (selectedObject && selectedObject.cameraPosition) {
      camera.position.lerp(selectedObject.cameraPosition, 0.03);
    }
  });

  const [primitives] = useState([]);

  useLayoutEffect(() => {
    tl.current = gsap.timeline();

    tl.current.to(
      camera.position,
      {
        duration: 2,
        y: 1.25,
      },
      0
    )
  }, []);

  const presetTexture = useEnvironment({ preset: 'city' })

  useMemo(() => {
    gltf.scene.traverse(obj => {

      if (obj.name === 'CARS') {
        carsMesh = obj;
      }

      if (obj.material && (obj.material.name === 'Glass HOTEL' || obj.material.name === 'Glass kromhouthal')) {
        obj.envMap = scene.environment;
        obj.flatShading = false;
        obj.normalMap = presetTexture;
        obj.material.opacity = 0.5;
        obj.material.metalness = 1;
        obj.material.envMapIntensity = 1;
        obj.material.transparent = true;
      }

      sceneObjects.forEach(objData => {
        if (obj.name === objData.id && objData.label) {
          obj.interactiveMapObject = true;
          objData.mesh = obj;
          primitives.push(<InteractiveMapObject
            key={objData.mesh.id}
            objData={objData}
            onClick={onClick.bind(null, objData)}
            onPointerEnter={onPointerOverObject.bind(null, objData)}
            onPointerLeave={onPointerLeavesObject.bind(null, objData)}
            parentRef={parentRef}
          />);
        }
      });

      obj.receiveShadow = true;
      obj.castShadow = true;
    });
  }, [gltf]);


  return (
    <>
      <mesh onClick={(e) => {
        if (selectedObject && e.object && !e.interactiveMapObject) {
          setSelectedObject(null);
          if (savedCameraPosition) {
            camera.position.set(savedCameraPosition.x, savedCameraPosition.y, savedCameraPosition.z);
            savedCameraPosition = null;
          }
        }
        if (e.object.name === 'Line001' || e.object.name === 'Water') {
          console.log('Camera', `new Vector3(${e.point.x}, 1, ${e.point.z}),`);
          const point = carsMesh.worldToLocal(e.point);
          console.log(`new Vector3(${(e.point.x + carsMesh.position.x) * carsMesh.scale.x}, 0.01, ${(e.point.z + carsMesh.position.z) * carsMesh.scale.z}),`);
        } else {
          //console.log(e.object.name);
        }
      }}>
        <primitive
          castShadow
          receiveShadow
          scale={[0.01, 0.01, 0.01]} position={[1.5, 0, -1]}
          object={gltf.scene}
          name={'loaded scene'}
        >
          {primitives}
          <MotionObjects scene={gltf.scene}/>
        </primitive>

      </mesh>
      <directionalLight
        castShadow
        shadowDarkness={0.1}
        intensity={1.7}
        position={[2.5, 8, 10]}
        shadow-mapSize={[1024, 1024]}
        shadowBias={-0.0001}
      ></directionalLight>
    </>
  );
};


function onPointerOverObject(e) {
  //setOpacity(this.mesh, 0.5);
  //console.log(this.label)
}

function onPointerLeavesObject(e) {
  //setOpacity(this.mesh, 1);
}