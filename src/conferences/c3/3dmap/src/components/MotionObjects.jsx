import {motionPaths} from '../motionPaths.jsx';
import {useMemo, useRef} from 'react';
import {CatmullRomCurve3, Matrix4, Quaternion, Vector2} from 'three';
import {useFrame} from "@react-three/fiber";
import {MotionPathControls, useMotion} from "@react-three/drei";

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
  const curve = useMemo(() => {
    return new CatmullRomCurve3(
      path.points,
      true,
      'centripetal',
      0.1
    );
  }, [path]);
  const poi = useRef();
  if (!mesh || !path.points || !path.points.length) {
    return <></>;
  }
  return <>
    <MotionPathControls damping={0} object={poi} curves={[curve]}>
      <Loop mesh={mesh} curve={curve} factor={path.factor}/>
    </MotionPathControls>
    <primitive object={mesh} ref={poi}/>
  </>
}

function Loop({mesh, factor = 0.02}) {
  const motion = useMotion();
  useFrame((state, delta) => {
    motion.current += Math.min(0.1, delta) * factor;
    const rotationMatrix = new Matrix4();
    const targetQuaternion = new Quaternion();
    rotationMatrix.lookAt(motion.next, mesh.position, mesh.up);
    targetQuaternion.setFromRotationMatrix(rotationMatrix);
    mesh.quaternion.rotateTowards(targetQuaternion, 1);
  })
}

function normalizeAngle(angle) {
  angle = angle % (2 * Math.PI);

  if (angle >= 0) {
    return angle;
  } else {
    return angle + 2 * Math.PI;
  }
}
