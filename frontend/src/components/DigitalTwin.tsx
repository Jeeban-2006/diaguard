import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface DigitalTwinProps {
  complications?: {
    kidney_risk: number;
    eye_risk: number;
    nerve_risk: number;
    cardiovascular_risk: number;
  };
}

const getRiskColor = (risk: number = 0) => {
  const val = Math.max(0, Math.min(1, risk));
  const green = new THREE.Color('#4ade80');
  const yellow = new THREE.Color('#facc15');
  const red = new THREE.Color('#f87171');
  
  if (val < 0.5) {
    return green.lerp(yellow, val * 2);
  } else {
    return yellow.lerp(red, (val - 0.5) * 2);
  }
};

const Organ = ({ position, scale, color, name, isPulsing = false }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (isPulsing && meshRef.current) {
      const pulseScale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.05;
      meshRef.current.scale.set(scale[0] * pulseScale, scale[1] * pulseScale, scale[2] * pulseScale);
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.8}
        roughness={0.1}
        metalness={0.5}
      />
    </mesh>
  );
};

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ complications }) => {
  const c = complications || { kidney_risk: 0, eye_risk: 0, nerve_risk: 0, cardiovascular_risk: 0 };
  
  const heartColor = getRiskColor(c.cardiovascular_risk);
  const kidneyColor = getRiskColor(c.kidney_risk);
  const eyeColor = getRiskColor(c.eye_risk);
  const nerveColor = getRiskColor(c.nerve_risk);

  return (
    <div className="w-full h-[400px] relative rounded-2xl overflow-hidden bg-gradient-to-b from-transparent to-[#080c10]/50 border border-white/5">
      <div className="absolute inset-0 pointer-events-none z-10 p-4">
        <h3 style={{ fontFamily: 'var(--dg-font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--dg-text-primary)' }}>Metabolic Twin</h3>
        <p style={{ fontFamily: 'var(--dg-font-body)', fontSize: '0.75rem', color: 'var(--dg-text-muted)' }}>Real-time complication risks</p>
        
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
           <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: heartColor.getStyle() }}></span> Heart
           </div>
           <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: kidneyColor.getStyle() }}></span> Kidneys
           </div>
           <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: eyeColor.getStyle() }}></span> Eyes
           </div>
           <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: nerveColor.getStyle() }}></span> Nerves
           </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          {/* Anatomical Mannequin Wireframe */}
          <group>
            {/* Head */}
            <mesh position={[0, 1.9, 0]}>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
            </mesh>
            {/* Neck */}
            <mesh position={[0, 1.45, 0]}>
              <cylinderGeometry args={[0.15, 0.2, 0.3, 8]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
            </mesh>
            {/* Torso */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.5, 0.4, 1.6, 16]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
            </mesh>
            {/* Shoulders & Upper Arms */}
            <mesh position={[-0.7, 0.9, 0]} rotation={[0, 0, -0.3]}>
              <capsuleGeometry args={[0.15, 0.8, 4, 8]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
            </mesh>
            <mesh position={[0.7, 0.9, 0]} rotation={[0, 0, 0.3]}>
              <capsuleGeometry args={[0.15, 0.8, 4, 8]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
            </mesh>
            {/* Lower Arms */}
            <mesh position={[-0.95, -0.1, 0]} rotation={[0, 0, -0.1]}>
              <capsuleGeometry args={[0.12, 0.7, 4, 8]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
            </mesh>
            <mesh position={[0.95, -0.1, 0]} rotation={[0, 0, 0.1]}>
              <capsuleGeometry args={[0.12, 0.7, 4, 8]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
            </mesh>
            {/* Pelvis */}
            <mesh position={[0, -0.4, 0]}>
              <capsuleGeometry args={[0.4, 0.2, 8, 16]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
            </mesh>
            {/* Thighs */}
            <mesh position={[-0.25, -1.2, 0]}>
              <capsuleGeometry args={[0.2, 0.9, 4, 8]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
            </mesh>
            <mesh position={[0.25, -1.2, 0]}>
              <capsuleGeometry args={[0.2, 0.9, 4, 8]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
            </mesh>
            {/* Calves */}
            <mesh position={[-0.25, -2.4, 0]}>
              <capsuleGeometry args={[0.15, 0.9, 4, 8]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
            </mesh>
            <mesh position={[0.25, -2.4, 0]}>
              <capsuleGeometry args={[0.15, 0.9, 4, 8]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
            </mesh>
          </group>

          <Organ name="Heart" position={[-0.15, 0.8, 0.2]} scale={[0.2, 0.2, 0.2]} color={heartColor} isPulsing={true} />
          <Organ name="Left Kidney" position={[-0.2, 0.2, -0.1]} scale={[0.12, 0.18, 0.12]} color={kidneyColor} />
          <Organ name="Right Kidney" position={[0.2, 0.2, -0.1]} scale={[0.12, 0.18, 0.12]} color={kidneyColor} />
          
          <Organ name="Left Eye" position={[-0.15, 1.9, 0.3]} scale={[0.08, 0.08, 0.08]} color={eyeColor} />
          <Organ name="Right Eye" position={[0.15, 1.9, 0.3]} scale={[0.08, 0.08, 0.08]} color={eyeColor} />

          {/* Central Nervous System Node / Spine */}
          <mesh position={[0, 0.5, -0.15]}>
            <cylinderGeometry args={[0.04, 0.04, 1.6, 8]} />
            <meshStandardMaterial color={nerveColor} emissive={nerveColor} emissiveIntensity={0.8} />
          </mesh>
        </Float>

        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
};
