import { GroupProps } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { map } from '@/utils/math'
import React from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'

interface Particle {
  size: number
  angle: number
  initialSize: number
  position: THREE.Vector3
  initialSpeedMagnitude: number
  speedMagnitude: number
  speed: THREE.Vector3
  lifespan: number
  lifespanLeft: number
}

export const Foam = ({ count = 10, color, ...props }: GroupProps & { count: number; color?: any }) => {
  const mesh = React.useRef<THREE.InstancedMesh>(null)
  const MAX_COUNT = 150
  const DUMMY = React.useMemo(() => new THREE.Object3D(), [])
  const spawnFrequency = 0.01
  const spawnTimer = React.useRef(spawnFrequency)
  const [particles, setParticles] = React.useState<Particle[]>([])
  const angle = React.useRef(0)

  const {
    color: _color,
    initialLifespan,
    initialSpeed,
    lifespanVariation,
    speedVariation,
  } = useControls('Foam', {
    color: '#b7efff',
    initialSpeed: { min: 0.1, max: 10, value: 1.3 },
    speedVariation: { min: 0, max: 1, value: 0.1 },
    initialLifespan: { min: 0.1, max: 10, value: 1.5 },
    lifespanVariation: { min: 0, max: 1, value: 0.1 },
  })
  const c = color || _color

  // Generate some random positions, speed factors and timings
  useFrame((state, delta) => {
    // spawn new particles
    if (!mesh.current) return

    spawnTimer.current -= delta

    if (spawnTimer.current <= 0) {
      spawnTimer.current = spawnFrequency
      if (particles.length < MAX_COUNT) {
        angle.current = (angle.current + 20) % 360

        const particleInitialSize = THREE.MathUtils.randFloat(0.1, 0.3)
        const lifespan = THREE.MathUtils.randFloat(
          initialLifespan - lifespanVariation * initialLifespan,
          initialLifespan + lifespanVariation * initialLifespan,
        )
        const speed = THREE.MathUtils.randFloat(
          initialSpeed - speedVariation * initialSpeed,
          initialSpeed + speedVariation * initialSpeed,
        )
        const _angle = THREE.MathUtils.randFloat(angle.current - 10, angle.current + 10)

        setParticles([
          ...particles,
          {
            initialSize: particleInitialSize,
            size: particleInitialSize,
            position: new THREE.Vector3(
              Math.sin(THREE.MathUtils.degToRad(_angle)) * 0.1,
              0,
              Math.cos(THREE.MathUtils.degToRad(_angle)) * 0.1,
            ),
            initialSpeedMagnitude: speed,
            speedMagnitude: speed,
            angle: _angle,
            speed: new THREE.Vector3(
              Math.sin(THREE.MathUtils.degToRad(_angle)) * speed,
              0,
              Math.cos(THREE.MathUtils.degToRad(_angle)) * speed,
            ),
            lifespan,
            lifespanLeft: lifespan,
          } as Particle,
        ])
        if (particles.length === 1) console.log(particles[0].size)
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]

      // update position
      particle.speedMagnitude = map(
        particle.lifespanLeft,
        0,
        particle.lifespan,
        particle.initialSpeedMagnitude * 0.3,
        particle.initialSpeedMagnitude,
      )
      particle.speed.x = Math.sin(THREE.MathUtils.degToRad(particle.angle)) * particle.speedMagnitude
      particle.speed.z = Math.cos(THREE.MathUtils.degToRad(particle.angle)) * particle.speedMagnitude
      particle.position.add(particle.speed.clone().multiplyScalar(delta))
      particle.size = map(particle.lifespanLeft, 0, particle.lifespan, 0, particle.initialSize)
      particle.lifespanLeft -= delta

      DUMMY.position.copy(particle.position)
      DUMMY.scale.set(particle.size, particle.size, particle.size)
      DUMMY.updateMatrix()

      mesh.current.setMatrixAt(i, DUMMY.matrix)

      // remove dead particles
      if (particle.lifespanLeft < 0) {
        setParticles([...particles.slice(0, i), ...particles.slice(i + 1)])
      }
    }

    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group {...props}>
      <instancedMesh ref={mesh} args={[null, null, particles.length]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={c} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}
