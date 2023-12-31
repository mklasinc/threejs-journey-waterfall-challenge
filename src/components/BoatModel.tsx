/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useImperativeHandle, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva'

export const BoatModel = React.forwardRef(
  ({ children = null, ...props }: React.PropsWithChildren & GroupProps, ref) => {
    const { nodes } = useGLTF('/models/watercraftPack_012.gltf') as any
    const rootRef = useRef(null)
    const rotorLeftRef = useRef(null)
    const rotorRightRef = useRef(null)

    useImperativeHandle(ref, () => ({
      root() {
        return rootRef.current
      },
      rotorLeft() {
        return rotorLeftRef.current
      },
      rotorRight() {
        return rotorRightRef.current
      },
    }))

    const { envMapIntensity } = useControls('BoatModel', {
      envMapIntensity: {
        value: 0.05,
        min: 0,
        max: 1,
      },
    })

    const material = useMemo(() => new THREE.MeshStandardMaterial(), [])

    useControls('BoatModelMaterial', {
      color: {
        value: '#000000',
        onChange: (color: string) => {
          material.color = new THREE.Color(color)
        },
      },
      roughness: {
        value: 0.5,
        min: 0,
        max: 1,
        onChange: (roughness: number) => {
          material.roughness = roughness
        },
      },
      metalness: {
        value: 1,
        min: 0,
        max: 1,
        onChange: (metalness: number) => {
          material.metalness = metalness
        },
      },
    })

    return (
      <group {...props} dispose={null} ref={rootRef} name="BOAT">
        {/* <mesh
          ref={rotorLeftRef}
          castShadow
          receiveShadow
          geometry={nodes.Mesh3_Group4_Group1_Model.geometry}
          material={materials.Grey_metal_1}
        />
        <mesh
          ref={rotorRightRef}
          castShadow
          receiveShadow
          geometry={nodes.Mesh4_Group5_Group1_Model.geometry}
          material={materials.Grey_metal_1}
        /> */}
        {/* <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh1_Group2_Group1_Model_1.geometry}
          material={materials.Dark_blue_metal}
        /> */}
        {/* <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh1_Group2_Group1_Model_1_1.geometry}
          material={materials.Dark_metal}
        /> */}
        {/* <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh2_Group3_Group1_Model_1.geometry}
          material={materials.Dark_blue_metal}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh2_Group3_Group1_Model_1_1.geometry}
          material={materials.Dark_metal}
        /> */}
        <mesh
          geometry={nodes.Mesh5_Group1_Model_1.geometry}
          material={material}
          material-envMapIntensity={envMapIntensity}
        />
        <mesh
          geometry={nodes.Mesh5_Group1_Model_1_1.geometry}
          material={material}
          material-envMapIntensity={envMapIntensity}
        />
        <mesh
          geometry={nodes.Mesh5_Group1_Model_1_2.geometry}
          material={material}
          material-envMapIntensity={envMapIntensity}
        />
        <mesh
          geometry={nodes.Mesh5_Group1_Model_1_3.geometry}
          material={material}
          material-envMapIntensity={envMapIntensity}
        />
        <mesh
          geometry={nodes.Mesh5_Group1_Model_1_4.geometry}
          material={material}
          material-envMapIntensity={envMapIntensity}
        />
        {children}
      </group>
    )
  },
)

BoatModel.displayName = 'BoatModel'

useGLTF.preload('/models/watercraftPack_012.gltf')
