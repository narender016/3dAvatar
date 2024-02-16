import { DoubleSide } from "three";
import { useTexture } from "@react-three/drei";
import imgBGWebp from "../images/bg.webp";

export default function Comp() {
  const texture = useTexture(imgBGWebp);
  return (
    //  position={[0, 0, -0.2]} rotation={[-Math.PI / 2, 0, 0]}
    // <mesh position={[0, 1.6, -1.0]} scale={[0.215, 0.215, 0.6]}>
    <mesh position={[0, 1.6, -1.0]} scale={[0.215, 0.215, 0.6]}>
      <planeGeometry attach="geometry" args={[10, 10, 2]} />
      <meshStandardMaterial attach="material" map={texture} side={DoubleSide} />
      <mesh position={[0, 0, -5]} />
    </mesh>
  );
}
