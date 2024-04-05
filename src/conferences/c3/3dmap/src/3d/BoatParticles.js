import Nebula, {SpriteRenderer} from 'three-nebula';
import {particlePreset} from './particlePreset.js';
import * as THREE from 'three';
import 'intersection-observer';

let isVisible = false;

const io = new IntersectionObserver(e => {
  isVisible = e[0] && e[0].isIntersecting;
});

function animate(nebula, scene, camera, mesh, gl) {
  if (isVisible) {
    nebula.update();
    const emitter = nebula.emitters[0];
    const pos = mesh.parent.localToWorld(mesh.position.clone());
    pos.y = 0;
    emitter.position = pos;
    const force = emitter.behaviours[0];
    const xforce = Math.sin(mesh.rotation.y + Math.PI) / 2000;
    const zforce = Math.cos(mesh.rotation.y + Math.PI) / 2000;
    force.reset(xforce, 0, zforce);
  }
  requestAnimationFrame(() => animate(nebula, scene, camera, mesh, gl));
}

export class BoatParticles {
  constructor(mesh, scene, camera, gl) {
    io.observe(gl.domElement);
    Nebula.fromJSONAsync(particlePreset, THREE).then(loaded => {
      const nebulaRenderer = new SpriteRenderer(scene, THREE);
      const nebula = loaded.addRenderer(nebulaRenderer);
      animate(nebula, scene, camera, mesh, gl);
    });
  }
}
