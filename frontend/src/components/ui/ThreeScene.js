import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as THREE from 'three';

const ThreeScene = () => {
  const mountRef = useRef(null);
  const { mode } = useSelector((state) => state.theme);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create floating movie-related objects
    const objects = [];

    // Create cinema reel geometry
    const reelGeometry = new THREE.CylinderGeometry(1, 1, 0.3, 16);
    const reelMaterial = new THREE.MeshPhongMaterial({ 
      color: mode === 'dark' ? 0x8b5cf6 : 0x3b82f6,
      shininess: 100,
      transparent: true,
      opacity: 0.8
    });

    // Create multiple movie reels
    for (let i = 0; i < 5; i++) {
      const reel = new THREE.Mesh(reelGeometry, reelMaterial.clone());
      reel.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      reel.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(reel);
      objects.push({
        mesh: reel,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: Math.random() * 0.02 + 0.01,
        floatOffset: Math.random() * Math.PI * 2
      });
    }

    // Create film strip objects
    const filmStripGeometry = new THREE.BoxGeometry(0.2, 4, 0.1);
    const filmStripMaterial = new THREE.MeshPhongMaterial({ 
      color: mode === 'dark' ? 0xfbbf24 : 0xf59e0b,
      transparent: true,
      opacity: 0.7
    });

    for (let i = 0; i < 3; i++) {
      const filmStrip = new THREE.Mesh(filmStripGeometry, filmStripMaterial.clone());
      filmStrip.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );
      filmStrip.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(filmStrip);
      objects.push({
        mesh: filmStrip,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.03,
          y: (Math.random() - 0.5) * 0.03,
          z: (Math.random() - 0.5) * 0.03
        },
        floatSpeed: Math.random() * 0.015 + 0.01,
        floatOffset: Math.random() * Math.PI * 2
      });
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      mode === 'dark' ? 0x8b5cf6 : 0x3b82f6, 
      0.8
    );
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Position camera
    camera.position.z = 15;

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      objects.forEach((obj, index) => {
        // Rotation
        obj.mesh.rotation.x += obj.rotationSpeed.x;
        obj.mesh.rotation.y += obj.rotationSpeed.y;
        obj.mesh.rotation.z += obj.rotationSpeed.z;

        // Floating motion
        const time = Date.now() * 0.001;
        obj.mesh.position.y += Math.sin(time * obj.floatSpeed + obj.floatOffset) * 0.01;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mode]);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{ zIndex: 1 }}
    />
  );
};

export default ThreeScene;