import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, Environment } from "@react-three/drei";
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

function StadiumModel() {
  const { scene } = useGLTF("/models/stadium/scene.gltf");
  return (
    <primitive
      object={scene}
      scale={0.001}
      position={[0, -2, 0]}
      rotation={[0, 0, 0]}
    />
  );
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
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[section.position_x, section.position_y, section.position_z]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[isSelected ? 0.45 : hovered ? 0.4 : 0.3, 16, 16]} />
        <meshStandardMaterial
          color={section.color}
          emissive={section.color}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.2}
          transparent
          opacity={isSelected ? 1 : hovered ? 0.9 : 0.7}
        />
      </mesh>

      {/* Pulsing ring for selected */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshStandardMaterial
            color={section.color}
            emissive={section.color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Label on hover or select */}
      {(hovered || isSelected) && (
        <Html
          position={[0, 0.7, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: "none" }}
        >
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-center whitespace-nowrap shadow-xl">
            <p className="text-xs font-bold text-foreground">{section.name}</p>
            <p className="text-xs text-primary font-semibold">৳{section.price.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">
              {section.available_seats} seats left
            </p>
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

export const StadiumViewer = ({
  sections,
  selectedSection,
  onSelectSection,
}: StadiumViewerProps) => {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-border bg-background/50">
      {/* Instructions overlay */}
      <div className="absolute top-3 left-3 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
        <p className="text-xs text-muted-foreground">
          🖱️ Drag to rotate • Scroll to zoom • Click sections to select
        </p>
      </div>

      <Canvas
        camera={{ position: [12, 8, 12], fov: 45 }}
        shadows
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.3} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />

        <Suspense fallback={<LoadingFallback />}>
          <StadiumModel />

          {/* Section markers */}
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
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate={!selectedSection}
          autoRotateSpeed={0.5}
        />

        <Environment preset="city" />
      </Canvas>

      {/* Credit */}
      <div className="absolute bottom-2 right-2 z-10">
        <p className="text-[9px] text-muted-foreground/50">
          3D Model: "Camp Nou Stadium" by farhad.Guli (CC-BY-4.0)
        </p>
      </div>
    </div>
  );
};

// Preload the model
useGLTF.preload("/models/stadium/scene.gltf");
