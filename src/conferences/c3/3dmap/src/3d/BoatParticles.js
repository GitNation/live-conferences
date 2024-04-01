import Nebula, {SpriteRenderer} from 'three-nebula';
import {particlePreset} from './particlePreset.js';
import * as THREE from "three";

function animate(nebula, scene, camera, mesh) {
  requestAnimationFrame(() => animate(nebula, scene, camera, mesh));

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

export class BoatParticles {
  constructor(mesh, scene, camera) {
    Nebula.fromJSONAsync(particlePreset, THREE).then(loaded => {
      const nebulaRenderer = new SpriteRenderer(scene, THREE);
      const nebula = loaded.addRenderer(nebulaRenderer);
      animate(nebula, scene, camera, mesh);
    });
  }
}
