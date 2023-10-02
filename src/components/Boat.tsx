import React, { useRef } from 'react'
import * as THREE from 'three'
import { useKeyboardControls } from '@react-three/drei'
import { useControls } from 'leva'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { damp } from '@/utils/math'
import { BoatModel } from './BoatModel'
import { useStore } from '@/store'
import { WATERFALL_FAR_LIMIT, WATERFALL_NEAR_LIMIT } from '@/constants'

const VECTOR = {
  ORIGIN: new THREE.Vector3(),
  DUMMY: new THREE.Vector3(),
  UP: new THREE.Vector3(0, 1, 0),
  DOWN: new THREE.Vector3(0, -1, 0),
  LEFT: new THREE.Vector3(-1, 0, 0),
  RIGHT: new THREE.Vector3(1, 0, 0),
}

const BOAT_VECTOR = {
  FORWARD: new THREE.Vector3(0, 0, 1),
  BACKWARD: new THREE.Vector3(0, 0, -1),
  LEFT: new THREE.Vector3(-1, 0, 0),
  RIGHT: new THREE.Vector3(1, 0, 0),
}

export const Boat = () => {
  const rigidBody = React.useRef<RapierRigidBody>(null)
  const boat = React.useRef<{
    root: () => THREE.Object3D
    rotorLeft: () => THREE.Object3D
    rotorRight: () => THREE.Object3D
  }>(null)
  const motorRotation = React.useRef(0)
  const cameraAnchor = React.useRef<THREE.Object3D>(null)
  const lookAtAnchor = React.useRef<THREE.Object3D>(null)
  const velocity = React.useRef(new THREE.Vector3())
  const [sub, getKeys] = useKeyboardControls()

  const setHasUserInteracted = useStore((state) => state.setHasUserInteracted)

  React.useEffect(() => {
    return sub(
      (state) => state,
      () => setHasUserInteracted(true),
    )
  }, [])

  const { linearDamping, angularDamping, power, steerPower, debug, floaterArea, waterHeight, floatingPower } =
    useControls('Boat', {
      debug: false,
      linearDamping: {
        value: 0.5,
        min: 0,
        max: 1,
      },
      angularDamping: {
        value: 0.5,
        min: 0,
        max: 5,
      },
      power: {
        value: 10,
        min: 0,
        max: 50,
      },
      steerPower: {
        value: 0.8,
        min: 0,
        max: 5,
      },
      floaterArea: {
        x: 1.5,
        y: 2,
      },
      waterHeight: {
        min: -1,
        max: 5,
        value: 0.05,
      },
      floatingPower: {
        min: 0,
        max: 20,
        value: 1.5,
      },
    })

  /**
   * Controls
   */

  const isSteering = React.useRef(false)
  const audioMixNodes = useStore((state) => state.audioMixNodes)

  useFrame(({ clock }, delta) => {
    if (!rigidBody.current || !cameraAnchor.current) return

    const { forward, backward, left, right } = getKeys()

    const impulse = { x: 0, y: 0, z: 0 }
    const torque = { x: 0, y: 0, z: 0 }

    const impulseStrength = power * delta
    const torqueStrength = steerPower * delta

    let _isSteering = false

    if (left) {
      _isSteering = true
      torque.y += torqueStrength
    }
    if (right) {
      _isSteering = true
      torque.y -= torqueStrength
    }
    if (forward) {
      _isSteering = true
      impulse.z += impulseStrength
      torque.y *= Math.max(0, 1 - 10 * delta)
    }
    if (backward) {
      _isSteering = true
      impulse.z -= impulseStrength
      torque.y *= Math.max(0, 1 - 10 * delta)
    }

    boat.current?.root().getWorldDirection(BOAT_VECTOR.FORWARD).normalize()
    let impulseForce = BOAT_VECTOR.FORWARD.multiplyScalar(impulse.z)

    const boatWorldPosition = boat.current?.root().getWorldPosition(VECTOR.DUMMY).clone() as THREE.Vector3
    const boatDistanceToWaterfall = boatWorldPosition?.distanceTo(VECTOR.ORIGIN) ?? 0
    const isBoatTooCloseToWaterfall = boatDistanceToWaterfall < WATERFALL_NEAR_LIMIT
    const isBoatTooFarFromWaterfall = boatDistanceToWaterfall > WATERFALL_FAR_LIMIT

    // if the boat is to close to waterfall, apply force to push it away based on distance
    if (isBoatTooCloseToWaterfall) {
      const difference = boatDistanceToWaterfall - WATERFALL_NEAR_LIMIT
      const normalizedOriginToBoatVector = boatWorldPosition.clone().sub(new THREE.Vector3()).normalize()
      normalizedOriginToBoatVector.y = 0
      impulseForce = normalizedOriginToBoatVector.multiplyScalar(Math.abs(difference) * impulseStrength * delta * 50)
    } else if (isBoatTooFarFromWaterfall) {
      const difference = boatDistanceToWaterfall - WATERFALL_FAR_LIMIT
      const normalizedOriginToBoatVector = new THREE.Vector3().sub(boatWorldPosition).normalize()
      normalizedOriginToBoatVector.y = 0
      impulseForce = normalizedOriginToBoatVector.multiplyScalar(Math.abs(difference) * impulseStrength * delta * 50)
    }

    // steering
    rigidBody.current.applyImpulse(impulseForce, true)
    rigidBody.current.applyTorqueImpulse(torque, true)

    // sound
    if (isSteering.current !== _isSteering) {
      isSteering.current = _isSteering
      const motorboatGain = audioMixNodes?.motorboatGain
      if (!motorboatGain) return
      motorboatGain.gain.exponentialRampTo(isSteering.current ? 0.4 : 0.0, 2)
    }
  })

  /**
   * Rotor rotation based on velocity
   */
  // useFrame((_, delta) => {
  //   if (!rigidBody.current || !boat.current) return
  //   motorRotation.current += rigidBody.current.linvel().z * delta * 10

  //   if (!boat.current.rotorLeft() || !boat.current.rotorRight()) return

  //   boat.current.rotorLeft().rotation.z = motorRotation.current
  //   boat.current.rotorRight().rotation.z = motorRotation.current
  // })

  /**
   * Buoyancy
   */
  const floaters = React.useMemo(
    () => [
      new THREE.Vector3(-floaterArea.x * 0.5, 0, floaterArea.y * 0.8),
      new THREE.Vector3(floaterArea.x * 0.5, 0, floaterArea.y * 0.8),
      new THREE.Vector3(-floaterArea.x * 0.5, 0, -floaterArea.y * 0.4),
      new THREE.Vector3(floaterArea.x * 0.5, 0, -floaterArea.y * 0.4),
    ],
    [floaterArea.x, floaterArea.y],
  )

  const floaterRefs = React.useRef<THREE.Object3D[]>([])

  useFrame((_, delta) => {
    if (!rigidBody.current) return
    for (let i = 0; i < floaters.length; i++) {
      const floater = floaterRefs.current[i]
      if (!floater) continue
      floater.getWorldPosition(VECTOR.DUMMY)
      const difference = VECTOR.DUMMY.y - waterHeight

      if (difference < 0) {
        const force = VECTOR.UP.clone().multiplyScalar(
          Math.abs(difference) * floatingPower * Math.min(delta, 0.05) * 10,
        )
        rigidBody.current.applyImpulseAtPoint(force, VECTOR.DUMMY, true)
      }
    }
  })

  const { lookAtAnchorPosition, cameraAnchorPosition } = useControls('Boat', {
    lookAtAnchorPosition: {
      value: { x: 0, y: 1, z: 3 },
      step: 0.01,
    },
    cameraAnchorPosition: {
      value: { x: 0, y: 3, z: -5 },
      step: 0.01,
    },
  })

  /**
   * Camera follow
   */
  const mouse = useRef({
    current: new THREE.Vector2(),
    target: new THREE.Vector2(),
  }).current
  useFrame(({ camera, pointer }, delta) => {
    if (!cameraAnchor.current || !boat.current || !lookAtAnchor.current || debug) return
    cameraAnchor.current.getWorldPosition(VECTOR.DUMMY)
    camera.position.x = damp(camera.position.x, VECTOR.DUMMY.x, 0.5, delta)
    camera.position.y = damp(camera.position.y, VECTOR.DUMMY.y, 0.1, delta)
    camera.position.z = damp(camera.position.z, VECTOR.DUMMY.z, 0.5, delta)
    lookAtAnchor.current.getWorldPosition(VECTOR.DUMMY)
    mouse.target.copy(pointer)
    mouse.current.x = damp(mouse.current.x, mouse.target.x, 0.05, delta)
    mouse.current.y = damp(mouse.current.y, mouse.target.y, 0.05, delta)
    VECTOR.DUMMY.x += mouse.current.x * 0.8
    VECTOR.DUMMY.y += mouse.current.y * 0.5 + 0.3
    camera.lookAt(VECTOR.DUMMY)
  })

  return (
    <RigidBody
      ref={rigidBody}
      linearDamping={linearDamping}
      angularDamping={angularDamping}
      position={[0, waterHeight, 27]}
      scale={0.6}
      rotation-y={Math.PI * 1.02}
      colliders="cuboid"
    >
      <BoatModel ref={boat} frustumCulled={false}>
        <object3D ref={cameraAnchor} position={[0, cameraAnchorPosition.y, cameraAnchorPosition.z]}>
          {debug && (
            <mesh scale={0.1}>
              <sphereGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="blue" depthTest={false} />
            </mesh>
          )}
        </object3D>

        <object3D ref={lookAtAnchor} position={[0, lookAtAnchorPosition.y, lookAtAnchorPosition.z]}>
          {debug && (
            <mesh scale={0.1}>
              <sphereGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="blue" depthTest={false} />
            </mesh>
          )}
        </object3D>

        {floaters.map((position, i) => (
          <object3D ref={(floater) => (floaterRefs.current[i] = floater!)} key={i} position={position}>
            {debug && (
              <mesh scale={0.1}>
                <sphereGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="red" depthTest={false} />
              </mesh>
            )}
          </object3D>
        ))}
      </BoatModel>
    </RigidBody>
  )
}
