import {extend, useFrame, useLoader, useThree} from '@react-three/fiber';
import {useMemo, useRef} from "react";
import {PlaneGeometry, RepeatWrapping, TextureLoader, Vector2, Vector3} from "three";
import {Water} from "../lib/Water.js";

extend({Water})

export function WaterAnimated({
                                  waterColor = 0x1999dd,
                                  width = 7.5,
                                  height = 9,
                              }) {
    const ref = useRef();
    const gl = useThree((state) => state.gl);
    const waterNormals = useLoader(TextureLoader, '/waternormals.jpeg');
    waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping;
    waterNormals.repeat.set(10, 10, 10);
    const geom = useMemo(() => {
        const result = new PlaneGeometry(width, height);
        result.scale(1, 1, 1)
        return result;
    }, []);
    const config = useMemo(
        () => ({
            textureWidth: 512,
            textureHeight: 512,
            waterNormals,
            sunDirection: new Vector3(-2.5,-8,-10),
            sunColor: 0xffffff,
            waterColor,
            fog: false,
            scale: 20,
            format: gl.encoding
        }),
        [waterNormals]
    );
    useFrame((state, delta) => (ref.current.material.uniforms.time.value += delta))
    return <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2}/>;
}
