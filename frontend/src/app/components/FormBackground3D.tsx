<<<<<<< HEAD
import { useEffect, useRef } from 'react';
=======
import React, { useEffect, useRef } from 'react';
>>>>>>> a3a9ef4 (Still working)
import * as THREE from 'three';

export function FormBackground3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Create floating particles/shapes
    const geometries = [
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.OctahedronGeometry(0.6),
      new THREE.TetrahedronGeometry(0.7),
      new THREE.IcosahedronGeometry(0.5)
    ];

    const materials = [
      new THREE.MeshPhongMaterial({ 
        color: 0x4fc3f7, 
        transparent: true, 
        opacity: 0.3,
        shininess: 100
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0x81c784, 
        transparent: true, 
        opacity: 0.3,
        shininess: 100
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0x64b5f6, 
        transparent: true, 
        opacity: 0.25,
        shininess: 100
      })
    ];

    const meshes: THREE.Mesh[] = [];
    const particleCount = 25;

    for (let i = 0; i < particleCount; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const mesh = new THREE.Mesh(geometry, material);

      // Random position
      mesh.position.x = (Math.random() - 0.5) * 60;
      mesh.position.y = (Math.random() - 0.5) * 60;
      mesh.position.z = (Math.random() - 0.5) * 40;

      // Random rotation
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      // Store initial position for parallax
      mesh.userData = {
        initialX: mesh.position.x,
        initialY: mesh.position.y,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.005,
          y: (Math.random() - 0.5) * 0.005,
          z: (Math.random() - 0.5) * 0.005
        },
        floatSpeed: Math.random() * 0.5 + 0.3,
        floatOffset: Math.random() * Math.PI * 2
      };

      scene.add(mesh);
      meshes.push(mesh);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4fc3f7, 1, 100);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x81c784, 1, 100);
    pointLight2.position.set(-20, -20, -20);
    scene.add(pointLight2);

    // Mouse move handler for parallax
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      // Animate each mesh
      meshes.forEach((mesh) => {
        // Rotation
        mesh.rotation.x += mesh.userData.rotationSpeed.x;
        mesh.rotation.y += mesh.userData.rotationSpeed.y;
        mesh.rotation.z += mesh.userData.rotationSpeed.z;

        // Floating motion
        mesh.position.y = mesh.userData.initialY + 
          Math.sin(elapsedTime * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 2;

        // Parallax effect based on mouse position
        const parallaxX = mouseRef.current.x * 3;
        const parallaxY = mouseRef.current.y * 3;
        
        mesh.position.x = mesh.userData.initialX + parallaxX;
        mesh.position.y += parallaxY * 0.5;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
