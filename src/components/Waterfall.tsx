import React, { useRef } from 'react'
import { useGLTF, Clone } from '@react-three/drei'
import { NodeToyMaterial } from '@/lib/@nodetoy/react'
import { data as waterfalShader } from './shaders/waterfallShaderData'
import { data as rippleShader } from './shaders/waterfallRippleShaderData'
import * as THREE from 'three'

export const Waterfall = () => {
  const waterfallRef = useRef<THREE.Group>(null)
  const { nodes: nodesWaterfall } = useGLTF('/models/cylinder-fix-uvs.gltf') as any
  const { nodes: nodesRipple } = useGLTF('/models/waterfall-ripple-smaller-hole.glb') as any

  return (
    <group ref={waterfallRef}>
      {/* WATERFALL */}
      <Clone
        name="WATERFALL"
        scale={[0.3, 0.3, 0.5]}
        position={[0, 5, 0]}
        object={nodesWaterfall.Scene}
        inject={<NodeToyMaterial fog={true} data={waterfalShader} envMapIntensity={0.2} />}
      />

      {/** WATER RIPPLES */}
      <Clone
        scale={7}
        rotation-x={Math.PI}
        position={[0, 0.2, 0]}
        object={nodesRipple.Scene}
        inject={<NodeToyMaterial data={rippleShader} fog={true} side={THREE.DoubleSide} transparent={true} />}
      />
    </group>
  )
}

useGLTF.preload('/models/cylinder-fix-uvs.gltf')
