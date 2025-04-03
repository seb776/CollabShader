import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'

const store = createXRStore({
    emulate: false,
})

export function App3D() {
    function openSession() {
        store.enterAR()
    }

    return <>
        <button onClick={openSession}>Enter AR</button>
        <Canvas>
            <XR store={store}>
                <mesh>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshNormalMaterial />
                </mesh>
            </XR>
        </Canvas>
    </>
}