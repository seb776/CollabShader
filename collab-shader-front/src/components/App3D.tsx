import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei';

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

function TestVR() {
    const refGroup = useRef<any>(undefined);
    const refInvisibleObject = useRef<any>(undefined);
    const { camera } = useThree();
    useFrame(()=>{
        if (refGroup && refGroup.current) {
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            refGroup.current.position.copy(camera.position).add(forward.multiplyScalar(2))
            refGroup.current.lookAt(camera.position);
        }
    });
    const SPACING = 0.5;
    const SIZE = 0.1;
    return <>
    <group ref={refGroup}>
        <mesh position={[-SPACING,0,0]}>
             <boxGeometry args={[SIZE,SIZE,SIZE]}/>
             <meshNormalMaterial/>
        </mesh>
        <mesh position={[SPACING,0,0]}>
             <boxGeometry args={[SIZE,SIZE,SIZE]}/>
             <meshNormalMaterial/>
        </mesh>
    </group>
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
                <OrbitControls/>
                <TestVR/>
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