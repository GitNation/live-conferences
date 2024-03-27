import {Canvas} from '@react-three/fiber';
import {Experience} from './components/Experience';
import {Environment, OrbitControls, ScrollControls} from '@react-three/drei';
import {Suspense} from "react";

function App() {
  return (
    // y -0.015 x + 0.01
    <Canvas shadows camera={{position: [-2.7, 3, 4], fov: 27}}>
      <Suspense fallback={null}>
        <Environment preset="city"/>
        <ScrollControls pages={2} damping={0.2}>
          <Experience/>
        </ScrollControls>
        {/*<OrbitControls></OrbitControls>*/}
      </Suspense>
    </Canvas>
  );
}

export default App;
