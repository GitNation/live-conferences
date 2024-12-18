import {Canvas} from '@react-three/fiber';
import {Experience} from './components/Experience';
import {Environment, ScrollControls, Loader} from '@react-three/drei';
import React, {Suspense} from 'react';
import {useInView} from 'react-intersection-observer';

function App() {
  const {ref, inView} = useInView();
  return (
    <>
      <Loader
        containerStyles={{
          position: 'relative',
        }}
        innerStyles={{
          width: 'auto',
          minWidth: '100px',
          fontFamily: 'JetBrainsMono',
          fontSize: 'clamp(96px, 9.3vw, 128px)',
        }}
      />
      <div style={{display: 'inline'}} ref={ref}>
        <Canvas frameloop={inView ? 'always' : 'never'} shadows camera={{position: [-2, 3.5, 3], fov: 27}}>
          <Suspense fallback={null}>
            <Environment preset="city"/>
            <ScrollControls pages={2} damping={0.2}>
              <Experience/>
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}

export default App;
