import { Canvas, useFrame } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { useRef } from 'react';
import * as THREE from 'three'

const store = createXRStore({
    emulate: false,
})

interface CustomShaderProps {
    code: string;
}

const VERTEX_SHADER = /*glsl*/`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function CustomShader(props: CustomShaderProps) {
    const refMat = useRef<any>(undefined);
    useFrame((state, delta) => {
        if (refMat && refMat.current) {
            refMat.current.uniforms.time.value += delta;
        }
    });
    return <>
        <mesh>
            <planeGeometry args={[2,2]}/>
            {/* <meshNormalMaterial/> */}
            <shaderMaterial ref={refMat} uniforms={{time: {value: 0}}} side={THREE.DoubleSide} vertexShader={VERTEX_SHADER} fragmentShader={props.code}/>
        </mesh>
    </>
}

export function App3D() {

    const fragmentShader = /*glsl*/`
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    void main() {
      gl_FragColor.rgba = vec4(0.5 + 0.3 * sin(vUv.yxx + time) + color, 1.0);
    }
  `;
    function openSession() {
        store.enterAR()
    }

    return <>
        <button onClick={openSession}>Enter AR</button>
        <Canvas>
            <XR store={store}>
                <group position={[0,0,-5]}>
                    <CustomShader code={fragmentShader}/>
                </group>
                <mesh position={[5,0,5]}>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshNormalMaterial />
                </mesh>
            </XR>
        </Canvas>
    </>
}