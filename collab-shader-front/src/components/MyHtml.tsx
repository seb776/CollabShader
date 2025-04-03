import React from "react";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { renderToString } from "react-dom/server";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";


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

  React.useEffect(() => {
    if (!refDiv.current)
      return;
    container.appendChild(node);
    html2canvas(refDiv.current, { backgroundColor: color }).then((canvas) => {
      // setTextureSize({ width: canvas.width, height: canvas.height });
      if (container.contains(node)) {
        container.removeChild(node);
      }
      canvas.toBlob((blob) => {
        if (blob === null) return;
        if (lastUrl.current !== null) {
          URL.revokeObjectURL(lastUrl.current);
        }
        const url = URL.createObjectURL(blob);
        lastUrl.current = url;
        setImage(url);
      });
    });
    return () => {
      if (!container) return;
      if (container.contains(node)) {
        container.removeChild(node);
      }
    };
  }, [node, viewSize, sceneSize, color]);

  const texture = useTexture(image);
  const refDiv = useRef<HTMLDivElement>(undefined);

  return (
    <>
    <window.__tunnel__.In>
    <div ref={refDiv} style={{position: 'absolute'}}>
    {children}
    </div>
    </window.__tunnel__.In>
    <mesh>
      <planeGeometry args={[2,2]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent />
    </mesh>
    </>
  );
}