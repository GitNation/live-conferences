import {Mesh} from "three";

export function setOpacity(obj, opacity) {
    obj.traverse(child => {
        if (child instanceof Mesh && child.material) {
            child.material.opacity = opacity;
            child.material.transparent = true;
        }
    });
}
