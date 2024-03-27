import {motionPaths} from '../motionPaths.js';
import {useMemo, useRef} from 'react';
import {CatmullRomCurve3, Vector2} from 'three';
import {MotionPathControls, useMotion} from "../../libs/MotionPathControls.js";
import {useFrame} from "@react-three/fiber";
import {Box} from "@react-three/drei";

const objectsToMove = {};

export const MotionObjects = ({scene}) => {
  const motionObjects = useMemo(() => {
    scene.traverse(child => {
      if (child.name && child.name.length && motionPaths[child.name]) {
        objectsToMove[child.name] = child;
      }
    });

    return Object.values(objectsToMove).map(mesh => <MotionObject key={'motion-' + mesh.id} mesh={mesh}
                                                                  path={motionPaths[mesh.name]}/>);
  }, []);

  return <>
    {motionObjects}
  </>
};

const MotionObject = ({mesh, path}) => {
  const curve = useMemo(() => new CatmullRomCurve3(
    path,
    true,
    undefined,
    1
  ), [path]);
  const poi = useRef();
  if (!mesh || !path || !path.length) {
    return <></>;
  }
  return <>
    <MotionPathControls damping={0} object={poi} curves={[curve]}>
      <Loop mesh={mesh} curve={curve}/>
    </MotionPathControls>
    <primitive object={mesh} ref={poi}/>
  </>
}

function Loop({curve, mesh, factor = 0.02}) {
  const motion = useMotion();
  useFrame((state, delta) => {
    motion.current += Math.min(0.1, delta) * factor;
    const meshPos = mesh.parent.localToWorld(mesh.position);
    const nextPos = mesh.parent.localToWorld(motion.next);
    const pos2 = new Vector2(meshPos.x * 100, meshPos.z * 100);
    const next2 = new Vector2(nextPos.x * 100, nextPos.z * 100);
    const orientation = new Vector2(pos2.x - next2.x, pos2.y - next2.y);
    let angle = Math.atan2(orientation.y, orientation.x);
    mesh.rotation.y = angle > 0 ? angle  + Math.PI / 2 : angle - Math.PI / 2;

    //console.log(angle, mesh.name);
    /*if (mesh.name === 'car_259') {
      console.log(angle, mesh.name);
    }*/
  })
}

function atan2Normalized(x,y) {
  var result = Math.atan2(x, y);
  if (result < 0) {
    result += (2 * Math.PI);
  }
  return(result);
}
