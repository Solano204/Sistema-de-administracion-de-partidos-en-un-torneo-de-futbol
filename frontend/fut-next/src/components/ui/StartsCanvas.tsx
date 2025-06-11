"use client";

import React, { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
// @ts-ignore
import * as random from "maath/random/dist/maath-random.esm";

const StarBackground = (props: any) => {
  const ref: any = useRef(null);

  // Define the number of stars
  const numberOfStars = 500; // Change this value to control the number of stars

  // Generate random points within a sphere
  const [sphere] = useState(() =>
    random.inSphere(new Float32Array(numberOfStars * 3), { radius: 1.2 })
  );

  // Rotate the stars over time
  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        {/* Define the appearance of the points */}
        <PointMaterial
          transparent // Enable transparency
          color="#fff" // Set color to white
          size={0.002} // Set size of each star
          sizeAttenuation={true} // Decrease size with distance
          depthWrite={false} // Disable depth writing
        />
      </Points>
    </group>
  );
};

const StarsCanvas = () => (
  <div className="w-full h-full  fixed inset-0 hidden dark:block">
    <Canvas camera={{ position: [0, 0, 1] }}>
      <Suspense fallback={null}>
        <StarBackground />
      </Suspense>
    </Canvas>
  </div>
);

export default StarsCanvas;