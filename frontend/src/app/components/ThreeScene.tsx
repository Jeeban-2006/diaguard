<<<<<<< HEAD
import { useEffect, useRef, useState } from 'react';
=======
import React, { useEffect, useRef, useState } from 'react';
>>>>>>> a3a9ef4 (Still working)
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

interface ThreeSceneProps {
  onZoneChange: (zone: string | null) => void;
  currentZone: string | null;
}

export function ThreeScene({ onZoneChange, currentZone }: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>(null);
  const interactiveObjectsRef = useRef<Map<THREE.Object3D, string>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xe8f4f8, 10, 50);
    scene.background = new THREE.Color(0xe8f4f8);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4fc3f7, 0.5, 20);
    pointLight1.position.set(-10, 5, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x81c784, 0.5, 20);
    pointLight2.position.set(10, 5, 0);
    scene.add(pointLight2);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create spatial zones
    createHeroZone(scene, interactiveObjectsRef.current);
    createFeaturesZone(scene, interactiveObjectsRef.current);
    createHowItWorksZone(scene, interactiveObjectsRef.current);
    createCTAZone(scene, interactiveObjectsRef.current);

    // Create portals/transitions
    createPortals(scene, interactiveObjectsRef.current);

    // Mouse move handler for raycasting
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Click handler
    const handleClick = () => {
      if (hoveredObject) {
        const zone = interactiveObjectsRef.current.get(hoveredObject);
        if (zone) {
          onZoneChange(zone);
          navigateToZone(zone, camera, controls);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      
      const deltaTime = clock.getDelta();
      controls.update();

      // Raycasting for hover effects
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        Array.from(interactiveObjectsRef.current.keys()),
        true
      );

      // Reset previous hover
      if (hoveredObject && hoveredObject !== intersects[0]?.object) {
        gsap.to(hoveredObject.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        setHoveredObject(null);
      }

      // Apply hover effect
      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object !== hoveredObject) {
          setHoveredObject(object);
          gsap.to(object.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3 });
          document.body.style.cursor = 'pointer';
        }
      } else {
        document.body.style.cursor = 'default';
      }

      // Animate objects
      scene.traverse((object) => {
        if (object.userData.animate) {
          object.rotation.y += deltaTime * 0.5;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Navigate to specific zone
  useEffect(() => {
    if (currentZone && cameraRef.current && controlsRef.current) {
      navigateToZone(currentZone, cameraRef.current, controlsRef.current);
    }
  }, [currentZone]);

  return <div ref={containerRef} className="fixed inset-0 -z-10" />;
}

function createHeroZone(scene: THREE.Scene, interactiveObjects: Map<THREE.Object3D, string>) {
  // Central hero element - DNA helix representing AI
  const helixGroup = new THREE.Group();
  helixGroup.position.set(0, 3, 0);
  
  const helixMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4fc3f7,
    emissive: 0x1976d2,
    emissiveIntensity: 0.3,
    metalness: 0.6,
    roughness: 0.3
  });

  for (let i = 0; i < 20; i++) {
    const angle1 = (i / 20) * Math.PI * 4;
    const angle2 = angle1 + Math.PI;
    const y = i * 0.3;
    
    const sphere1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      helixMaterial
    );
    sphere1.position.set(Math.cos(angle1) * 1.5, y, Math.sin(angle1) * 1.5);
    sphere1.castShadow = true;
    helixGroup.add(sphere1);

    const sphere2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      helixMaterial
    );
    sphere2.position.set(Math.cos(angle2) * 1.5, y, Math.sin(angle2) * 1.5);
    sphere2.castShadow = true;
    helixGroup.add(sphere2);

    // Connecting bars
    const barGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
    const barMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x81c784,
      metalness: 0.4,
      roughness: 0.6
    });
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.set(0, y, 0);
    bar.rotation.z = angle1;
    helixGroup.add(bar);
  }

  helixGroup.userData.animate = true;
  scene.add(helixGroup);
  interactiveObjects.set(helixGroup, 'hero');
}

function createFeaturesZone(scene: THREE.Scene, interactiveObjects: Map<THREE.Object3D, string>) {
  // Three feature pillars
<<<<<<< HEAD
  const features = [
=======
  const features: Array<{ name: string; position: [number, number, number]; color: number }> = [
>>>>>>> a3a9ef4 (Still working)
    { name: 'Risk Prediction', position: [-8, 2, -5], color: 0x42a5f5 },
    { name: 'Lifestyle Recommendations', position: [0, 2, -8], color: 0x66bb6a },
    { name: 'Explainable AI', position: [8, 2, -5], color: 0xab47bc }
  ];

  features.forEach((feature) => {
    const group = new THREE.Group();
    group.position.set(...feature.position);

    // Base platform
    const baseGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.3, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: feature.color,
      metalness: 0.5,
      roughness: 0.4
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Feature icon (floating cube)
    const iconGeometry = new THREE.BoxGeometry(1, 1, 1);
    const iconMaterial = new THREE.MeshStandardMaterial({ 
      color: feature.color,
      emissive: feature.color,
      emissiveIntensity: 0.4,
      metalness: 0.7,
      roughness: 0.2
    });
    const icon = new THREE.Mesh(iconGeometry, iconMaterial);
    icon.position.y = 1.5;
    icon.userData.animate = true;
    icon.castShadow = true;
    group.add(icon);

    // Floating particles
    const particleCount = 20;
    const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const particleMaterial = new THREE.MeshStandardMaterial({ 
      color: feature.color,
      emissive: feature.color,
      emissiveIntensity: 0.6
    });

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2 + Math.random() * 0.5;
      particle.position.set(
        Math.cos(angle) * radius,
        0.5 + Math.random() * 2,
        Math.sin(angle) * radius
      );
      group.add(particle);
    }

    scene.add(group);
    interactiveObjects.set(group, `feature-${feature.name.toLowerCase().replace(/\s+/g, '-')}`);
  });
}

function createHowItWorksZone(scene: THREE.Scene, interactiveObjects: Map<THREE.Object3D, string>) {
  // Three steps as connected pathway
<<<<<<< HEAD
  const steps = [
=======
  const steps: Array<{ position: [number, number, number]; color: number }> = [
>>>>>>> a3a9ef4 (Still working)
    { position: [-10, 1, 5], color: 0x4fc3f7 },
    { position: [-3, 1, 8], color: 0x66bb6a },
    { position: [4, 1, 5], color: 0xffa726 }
  ];

  steps.forEach((step, index) => {
    // Step platform
    const stepGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32);
    const stepMaterial = new THREE.MeshStandardMaterial({ 
      color: step.color,
      metalness: 0.6,
      roughness: 0.3
    });
    const stepMesh = new THREE.Mesh(stepGeometry, stepMaterial);
    stepMesh.position.set(...step.position);
    stepMesh.castShadow = true;
    stepMesh.receiveShadow = true;
    scene.add(stepMesh);
    interactiveObjects.set(stepMesh, `step-${index + 1}`);

    // Step number
    const textGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.2);
    const textMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      emissive: step.color,
      emissiveIntensity: 0.3
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(step.position[0], step.position[1] + 1.5, step.position[2]);
    textMesh.castShadow = true;
    scene.add(textMesh);

    // Connection path
    if (index < steps.length - 1) {
      const nextStep = steps[index + 1];
      const pathLength = Math.sqrt(
        Math.pow(nextStep.position[0] - step.position[0], 2) +
        Math.pow(nextStep.position[2] - step.position[2], 2)
      );
      
      const pathGeometry = new THREE.BoxGeometry(pathLength, 0.1, 0.5);
      const pathMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xb0bec5,
        metalness: 0.3,
        roughness: 0.7
      });
      const path = new THREE.Mesh(pathGeometry, pathMaterial);
      
      const midX = (step.position[0] + nextStep.position[0]) / 2;
      const midZ = (step.position[2] + nextStep.position[2]) / 2;
      path.position.set(midX, 0.5, midZ);
      
      const angle = Math.atan2(
        nextStep.position[2] - step.position[2],
        nextStep.position[0] - step.position[0]
      );
      path.rotation.y = angle;
      
      scene.add(path);
    }
  });
}

function createCTAZone(scene: THREE.Scene, interactiveObjects: Map<THREE.Object3D, string>) {
  // Large interactive button/portal
  const ctaGroup = new THREE.Group();
  ctaGroup.position.set(10, 2, 10);

  const buttonGeometry = new THREE.TorusGeometry(2, 0.3, 16, 32);
  const buttonMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4caf50,
    emissive: 0x2e7d32,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2
  });
  const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
  button.rotation.x = Math.PI / 2;
  button.userData.animate = true;
  button.castShadow = true;
  ctaGroup.add(button);

  // Pulsing center
  const centerGeometry = new THREE.SphereGeometry(1, 32, 32);
  const centerMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    emissive: 0x4caf50,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.8
  });
  const center = new THREE.Mesh(centerGeometry, centerMaterial);
  ctaGroup.add(center);

  scene.add(ctaGroup);
  interactiveObjects.set(ctaGroup, 'cta');
}

function createPortals(scene: THREE.Scene, interactiveObjects: Map<THREE.Object3D, string>) {
  // Navigation portals
<<<<<<< HEAD
  const portalPositions = [
=======
  const portalPositions: Array<{ pos: [number, number, number]; target: string }> = [
>>>>>>> a3a9ef4 (Still working)
    { pos: [-15, 1, 0], target: 'features' },
    { pos: [15, 1, 0], target: 'how-it-works' },
    { pos: [0, 1, -15], target: 'hero' }
  ];

  portalPositions.forEach(({ pos, target }) => {
    const portalGeometry = new THREE.RingGeometry(0.8, 1, 32);
    const portalMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x64b5f6,
      emissive: 0x1976d2,
      emissiveIntensity: 0.7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const portal = new THREE.Mesh(portalGeometry, portalMaterial);
    portal.position.set(...pos);
    portal.userData.animate = true;
    scene.add(portal);
    interactiveObjects.set(portal, target);
  });
}

function navigateToZone(
  zone: string,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls
) {
  const positions: Record<string, { camera: THREE.Vector3; target: THREE.Vector3 }> = {
    'hero': { camera: new THREE.Vector3(0, 5, 15), target: new THREE.Vector3(0, 2, 0) },
    'features': { camera: new THREE.Vector3(0, 8, -12), target: new THREE.Vector3(0, 2, -6) },
    'how-it-works': { camera: new THREE.Vector3(-5, 6, 12), target: new THREE.Vector3(-2, 1, 6) },
    'cta': { camera: new THREE.Vector3(15, 5, 15), target: new THREE.Vector3(10, 2, 10) }
  };

  const targetPos = positions[zone];
  if (targetPos) {
    gsap.to(camera.position, {
      x: targetPos.camera.x,
      y: targetPos.camera.y,
      z: targetPos.camera.z,
      duration: 2,
      ease: 'power2.inOut'
    });

    gsap.to(controls.target, {
      x: targetPos.target.x,
      y: targetPos.target.y,
      z: targetPos.target.z,
      duration: 2,
      ease: 'power2.inOut'
    });
  }
}