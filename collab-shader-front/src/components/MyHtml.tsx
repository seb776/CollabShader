import React from "react";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { renderToString } from "react-dom/server";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import tunnel from 'tunnel-rat'
import * as htmlToImage from 'html-to-image';
// Prevents html2canvas warnings
// @todo maybe remove this if it causes performance issues?
// HTMLCanvasElement.prototype.getContext = (function (origFn) {
//   return function (type, attribs) {
//     attribs = attribs || {};
//     attribs.preserveDrawingBuffer = true;
//     return origFn.call(this, type, attribs);
//   };
// })(HTMLCanvasElement.prototype.getContext);

let container = document.querySelector("#htmlContainer");
if (!container) {
  const node = document.createElement("div");
  node.setAttribute("id", "htmlContainer");
  node.style.position = "fixed";
  node.style.opacity = "0";
  node.style.pointerEvents = "none";
  document.body.appendChild(node);
  container = node;
}
(document as any).__tunnel__ = tunnel();
let tunn = (document as any).__tunnel__;

export default function Html({
  children,
  color = "transparent",
}) {
  const { camera, size: viewSize, gl } = useThree();

  const sceneSize = React.useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const fov = (cam.fov * Math.PI) / 180; // convert vertical fov to radians
    const height = 2 * Math.tan(fov / 2) * 5; // visible height
    const width = height * (viewSize.width / viewSize.height);
    return { width, height };
  }, [camera, viewSize]);

  const lastUrl = React.useRef(null);

  const [image, setImage] = React.useState(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
  );
  // const [textureSize, setTextureSize] = React.useState({ width, height });
  
  const node = React.useMemo(() => {
    const node = document.createElement("div");
    node.innerHTML = renderToString(children);
    return node;
  }, [children]);
  

  const refMat = useRef<THREE.MeshBasicMaterial>(null);
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  async function funcImagesStream() {
    while (true) {
      let prom = new Promise((resolve, err)=>{
        if (refDiv.current) {
          htmlToImage.toJpeg(refDiv.current).then((dataUrl) => {
            new THREE.TextureLoader().load(dataUrl, (tex) =>{
              if (refMat.current)
                refMat.current!.map = tex;
              resolve(null);
            } );
          });
        }
        resolve(null);
      });
      await prom.catch(()=>{});
      await delay(200)
    }
  }
  
  React.useEffect(() => {
    if (!refDiv.current)
      return;
    funcImagesStream();
    return;
    setInterval(()=>{

    // container.appendChild(node);

    return () => {
      // if (!container) return;
      // if (container.contains(node)) {
      //   container.removeChild(node);
      // }
    };
  }, 200)

  }, [node, viewSize, sceneSize, color]);

  const texture = useTexture(image);
  const refDiv = useRef<HTMLDivElement>(null);
  return (
    <>
    <tunn.In>
    <div ref={refDiv} style={{position: 'absolute', zIndex:9999, pointerEvents: "all", width: 500, height: 500}}>
    {children}
    </div>
    </tunn.In>
    <mesh position={[2.5,0,0]}>
      <planeGeometry args={[2,2]} />
      <meshBasicMaterial ref={refMat} map={texture} side={THREE.DoubleSide} transparent />
    </mesh>
    </>
  );
}