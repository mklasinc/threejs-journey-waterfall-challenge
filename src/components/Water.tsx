import React from 'react'
import { useControls } from 'leva'
import * as THREE from 'three'
import { NodeToyMaterial } from '@/lib/@nodetoy/react'
import { data } from './shaders/waterShaderData'

export const Water = () => {
  const {
    voronoiScale,
    voronoiSpeed: _voronoiSpeed,
    waveAmount,
    baseColor: _baseColor,
    rippleColor: _rippleColor,
  } = useControls('Water', {
    baseColor: '#020207',
    rippleColor: '#083b65',
    voronoiScale: {
      value: 500,
      min: 0,
      max: 500,
    },
    voronoiSpeed: {
      value: { x: 0, y: 0.001 },
      step: 0.01,
    },
    waveAmount: {
      value: 0,
      min: 0,
      max: 5,
      step: 0.01,
    },
  })

  const voronoiSpeed = React.useMemo(() => new THREE.Vector2(_voronoiSpeed.x, _voronoiSpeed.y), [_voronoiSpeed])

  const baseColor = React.useMemo(() => new THREE.Vector4(...new THREE.Color(_baseColor).toArray(), 1), [_baseColor])
  const rippleColor = React.useMemo(
    () => new THREE.Vector4(...new THREE.Color(_rippleColor).toArray(), 1),
    [_rippleColor],
  )

  return (
    <mesh rotation-x={THREE.MathUtils.degToRad(-90)} scale={20}>
      <planeGeometry args={[10, 10, 1, 1]} />
      <NodeToyMaterial
        fog={true}
        data={data}
        envMapIntensity={0.2}
        roughness={1}
        metalness={0}
        parameters={{
          voronoiScale,
          voronoiSpeed,
          waveAmount,
          baseColor,
          rippleColor,
        }}
      />
    </mesh>
  )
}
