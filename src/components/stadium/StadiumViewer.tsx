import { Suspense, useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, Environment, Center } from "@react-three/drei";
import * as THREE from "three";
import { Loader2 } from "lucide-react";

interface StadiumSection {
  id: string;
  name: string;
  section_label: string;
  tier: string;
  price: number;
  total_seats: number;
  available_seats: number;
  color: string;
  position_x: number;
  position_y: number;
  position_z: number;
}

interface StadiumViewerProps {
  sections: StadiumSection[];
  selectedSection: StadiumSection | null;
  onSelectSection: (section: StadiumSection) => void;
}

// Map section labels to positions around the stadium rim
// Stadium is roughly elliptical; positions are in scene units after centering
const SECTION_POSITIONS: Record<string, [number, number, number]> = {
  // VIP Longside - on the lower bowl seats, long sides
  "VIP-LW":  [-2.0, -0.3, 0],
  "VIP-LE":  [2.0, -0.3, 0],
  // VIP Shortside - on the lower bowl seats, behind goals
  "VIP-SN":  [0, -0.3, -1.5],
  "VIP-SS":  [0, -0.3, 1.5],
  // Longside Premium - 2nd ring seats
  "LP-W":    [-2.6, -0.1, 0.5],
  "LP-E":    [2.6, -0.1, -0.5],
  // Longside Standard - mid ring seats
  "LS-W":    [-2.9, 0.1, -0.6],
  "LS-E":    [2.9, 0.1, 0.6],
  // Shortside Standard - mid ring, ends
  "SS-N":    [-0.8, -0.1, -2.2],
  "SS-S":    [0.8, -0.1, 2.2],
  // Longside High - upper tier seats
  "LH-W":    [-3.2, 0.35, 0.3],
  "LH-E":    [3.2, 0.35, -0.3],
  // Shortside High - upper tier, ends
  "SH-N":    [-1.1, 0.25, -2.7],
  "SH-S":    [1.1, 0.25, 2.7],
};

function StadiumModel() {
  const { scene } = useGLTF("/models/stadium/scene.gltf");

  // Center the model
  useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
  }, [scene]);

  return <primitive object={scene} scale={0.001} />;
}

function SectionMarker({
  section,
  isSelected,
  onClick,
}: {
  section: StadiumSection;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const pos = SECTION_POSITIONS[section.section_label] || [section.position_x, section.position_y, section.position_z];
  const radius = isSelected ? 0.18 : hovered ? 0.16 : 0.12;

  return (
    <group position={pos}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
      >
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial
          color={section.color}
          emissive={section.color}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.2}
          transparent
          opacity={isSelected ? 1 : hovered ? 0.9 : 0.7}
        />
      </mesh>

      {(hovered || isSelected) && (
        <Html position={[0, 0.4, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-center whitespace-nowrap shadow-xl">
            <p className="text-xs font-bold text-foreground">{section.name}</p>
            <p className="text-xs text-primary font-semibold">৳{section.price.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{section.available_seats} seats left</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading Stadium...</p>
      </div>
    </Html>
  );
}

export const StadiumViewer = ({ sections, selectedSection, onSelectSection }: StadiumViewerProps) => {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-border bg-background/50">
      <div className="absolute top-3 left-3 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
        <p className="text-xs text-muted-foreground">
          🖱️ Drag to rotate • Scroll to zoom • Click sections to select
        </p>
      </div>

      <Canvas camera={{ position: [8, 5, 8], fov: 45 }} shadows gl={{ antialias: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.3} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />

        <Suspense fallback={<LoadingFallback />}>
          <StadiumModel />
          {sections.map((section) => (
            <SectionMarker
              key={section.id}
              section={section}
              isSelected={selectedSection?.id === section.id}
              onClick={() => onSelectSection(section)}
            />
          ))}
        </Suspense>

        <OrbitControls
          enablePan enableZoom enableRotate
          minDistance={4}
          maxDistance={20}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate={!selectedSection}
          autoRotateSpeed={0.5}
        />
        <Environment preset="city" />
      </Canvas>

      <div className="absolute bottom-2 right-2 z-10">
        <p className="text-[9px] text-muted-foreground/50">
          3D Model: "Camp Nou Stadium" by farhad.Guli (CC-BY-4.0)
        </p>
      </div>
    </div>
  );
};

useGLTF.preload("/models/stadium/scene.gltf");
