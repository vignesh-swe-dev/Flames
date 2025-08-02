import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeBackground({ targetColor = '#ff8fa3' }) {
  const canvasRef = useRef(null);
  const targetColorRef = useRef(new THREE.Color(targetColor));
  const [reducedMotion, setReducedMotion] = useState(false);

  // Update target color ref for smooth render-loop lerp
  useEffect(() => {
    targetColorRef.current.set(targetColor);
  }, [targetColor]);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    if (reducedMotion || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const isTouchDevice = typeof window !== 'undefined' && 
      (!window.matchMedia('(pointer: fine)').matches || 'ontouchstart' in window);
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
    const isLowPower = typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isSmallScreen,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const geometriesToDispose = [];
    const materialsToDispose = [];

    // 1. Particles (Fire/Love Dust) - adjusted for mobile & low-power devices
    const particlesCount = isSmallScreen || isLowPower ? 500 : 1800;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.4;
      colors[i * 3 + 2] = 0.4 + Math.random() * 0.4;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometriesToDispose.push(particlesGeometry);

    const particlesMaterial = new THREE.PointsMaterial({
      size: isSmallScreen ? 0.06 : 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    materialsToDispose.push(particlesMaterial);

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // 2. Floating Hearts - reuse single ShapeGeometry
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
    heartShape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1);
    heartShape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
    heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);

    const heartGeo = new THREE.ShapeGeometry(heartShape);
    geometriesToDispose.push(heartGeo);

    const hearts = [];
    const heartColors = [0xff4d6d, 0xff8fa3, 0xffb3c1, 0xc9184a, 0xff0054];
    const heartCount = isSmallScreen || isLowPower ? 14 : 38;

    for (let i = 0; i < heartCount; i++) {
      const heartMat = new THREE.MeshStandardMaterial({
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.3,
        roughness: 0.2,
        metalness: 0.3
      });
      materialsToDispose.push(heartMat);

      const heart = new THREE.Mesh(heartGeo, heartMat);
      const initialX = (Math.random() - 0.5) * 15;
      heart.position.set(
        initialX,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 8
      );
      heart.rotation.z = Math.PI;
      const baseScale = 0.15 + Math.random() * 0.3;
      heart.scale.setScalar(baseScale);
      scene.add(heart);
      hearts.push({
        mesh: heart,
        initialX,
        baseScale,
        pulseSpeed: 1.5 + Math.random() * 2.5,
        pulseOffset: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.015,
        rotSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    // 3. Glowing Torus Rings (Intended target for result color transition)
    const torusGeo = new THREE.TorusGeometry(4, 0.02, 16, 100);
    geometriesToDispose.push(torusGeo);

    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xff8fa3,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.8
    });
    materialsToDispose.push(torusMat);

    const torus1 = new THREE.Mesh(torusGeo, torusMat);
    const torus2 = new THREE.Mesh(torusGeo, torusMat);
    torus2.rotation.x = Math.PI / 2;
    scene.add(torus1, torus2);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xff8fa3, 1.5);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x4d6dff, 0.8);
    directionalLight2.position.set(-5, -5, 2);
    scene.add(directionalLight2);

    // Mouse Interaction (touch-free on mobile)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      if (isTouchDevice) return;
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    if (!isTouchDevice) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Animation loop with visibility pausing
    const clock = new THREE.Clock();
    let animationFrameId;
    let isPaused = false;

    const animate = () => {
      if (isPaused) return;

      const elapsed = clock.getElapsedTime();

      if (!isTouchDevice) {
        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;
        particles.rotation.y += 0.001 + targetX * 0.01;
        particles.rotation.x += 0.0005 + targetY * 0.01;
      } else {
        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;
      }

      hearts.forEach((h) => {
        h.mesh.position.y += h.speed;
        h.mesh.rotation.y += h.rotSpeed;

        // Clean time-based scale pulsing
        const currentScale = h.baseScale + Math.sin(elapsed * h.pulseSpeed + h.pulseOffset) * 0.035;
        h.mesh.scale.setScalar(currentScale);

        if (!isTouchDevice) {
          h.mesh.position.x += (h.initialX + targetX * 2 - h.mesh.position.x) * 0.05;
        }

        if (h.mesh.position.y > 8) h.mesh.position.y = -8;
      });

      torus1.rotation.z += 0.002;
      torus1.rotation.y += 0.001;
      torus2.rotation.z -= 0.002;
      torus2.rotation.x += 0.001;

      // Smoothly animate only intended objects toward target color
      torusMat.color.lerp(targetColorRef.current, 0.04);
      directionalLight1.color.lerp(targetColorRef.current, 0.04);

      if (!isTouchDevice) {
        camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Visibility change handler: pause render loop when tab hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationFrameId);
      } else {
        if (isPaused) {
          isPaused = false;
          clock.start();
          animate();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      if (!isTouchDevice) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div 
        className="canvas-container static-gradient-bg" 
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(255, 77, 109, 0.15) 0%, rgba(26, 5, 10, 0.95) 75%)`
        }}
      />
    );
  }

  return <canvas ref={canvasRef} className="canvas-container" aria-hidden="true" />;
}
