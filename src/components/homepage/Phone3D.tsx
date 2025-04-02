
import React, { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PresentationControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

function PhoneModel(props) {
  const meshRef = useRef()
  const [phoneTexture, setPhoneTexture] = useState(null)
  
  useEffect(() => {
    // Load texture inside useEffect to prevent issues during SSR/hydration
    new THREE.TextureLoader().load('/lovable-uploads/369e24ff-1db4-4135-bb76-f64501c73259.png', (texture) => {
      setPhoneTexture(texture)
    })
  }, [])
  
  return (
    <group {...props}>
      {/* Phone body */}
      <mesh 
        ref={meshRef} 
        castShadow 
        receiveShadow
        rotation={[0.1, -0.4, 0.1]}
      >
        <boxGeometry args={[3, 6, 0.2]} />
        <meshStandardMaterial 
          metalness={0.5}
          roughness={0.2}
          color="#1a1a1a" 
        />
      </mesh>
      
      {/* Phone screen - only render when texture is loaded */}
      {phoneTexture && (
        <mesh 
          position={[0, 0, 0.11]} 
          rotation={[0.1, -0.4, 0.1]}
        >
          <planeGeometry args={[2.6, 5.4]} />
          <meshBasicMaterial map={phoneTexture} toneMapped={false} />
        </mesh>
      )}
      
      {/* Phone frame */}
      <mesh 
        position={[0, 0, 0.12]} 
        rotation={[0.1, -0.4, 0.1]}
      >
        <ringGeometry args={[2.8/2, 2.9/2, 32]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}

export default function Phone3D() {
  // Add error boundary fallback
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center bg-crypto-dark/30 rounded-lg">
        <div className="text-center p-4">
          <p className="text-crypto-light">Unable to load 3D model</p>
          <p className="text-sm text-crypto-light/70 mt-2">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px]">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 10], fov: 45 }}
        onError={() => setHasError(true)}
      >
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <PresentationControls
          global
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 4, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
          config={{ mass: 2, tension: 400 }}
          snap={{ mass: 4, tension: 400 }}
        >
          <PhoneModel position={[0, 0, 0]} />
        </PresentationControls>
        <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={1.75} far={4.5} />
        <Environment preset="city" />
      </Canvas>
      <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-crypto-light opacity-70">
        Click and drag to rotate the phone
      </div>
    </div>
  )
}
