import React from 'react'
import { Environment, PerspectiveCamera, KeyboardControls } from '@react-three/drei'
import { NodeToyTick } from '@/lib/@nodetoy/react'
import { Leva, useControls } from 'leva'
import { Physics } from '@react-three/rapier'
import { Perf } from 'r3f-perf'
import { Foam } from '@/components/Foam'
import { Waterfall } from '@/components/Waterfall'
import { Water } from '@/components/Water'
import { Boat } from '@/components/Boat'
import { AudioMix } from '@/components/AudioMix'
import { UI } from '@/components/UI'
import { Effects } from '@/components/Effects'
import { Canvas } from '@react-three/fiber'
import Head from 'next/head'

export default function Home() {
  const {
    show: showFog,
    color: fogColor,
    near: fogNear,
    far: fogFar,
  } = useControls('Fog', {
    show: true,
    color: '#47559d',
    near: {
      value: 0,
      min: 0,
      max: 100,
    },
    far: {
      value: 30,
      min: 0,
      max: 100,
    },
  })

  return (
    <>
      <Head>
        <title>Miha Klasinc Three.js Journey Waterfall Challenge</title>
        <meta name="title" content="Miha Klasinc Three.js Journey Waterfall Challenge" key="title" />

        {/* Facebook Open Graph meta tags */}
        <meta name="og:title" content="Miha Klasinc Three.js Journey Waterfall Challenge" key="og:title" />
        <meta name="og:type" content="site" />
        <meta name="og:url" content="https://threejs-journey-waterfall-challenge.vercel.app/" key="og:url" />
        <meta name="og:image" content="/og.jpg" key="og:image" />
      </Head>
      <Leva hidden />
      <UI />
      <Canvas>
        <Effects />
        {/* <Perf /> */}
        <KeyboardControls
          map={[
            { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
            { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
            { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
            { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
            { name: 'jump', keys: ['Space'] },
          ]}
        >
          <color attach="background" args={[fogColor]} />
          {showFog && <fog attach="fog" args={[fogColor, fogNear, fogFar]} />}
          <ambientLight intensity={0.1} />
          <PerspectiveCamera makeDefault position={[0, 8, 10]} near={0.01} far={100} />
          <NodeToyTick />
          <Environment preset="city" />
          <Foam count={50} scale={2.2} position-y={0.3} />
          <Foam count={10} scale={1} position-y={0.3} color={'white'} />
          <AudioMix />
          <Physics gravity={[0, -1, 0]}>
            <Water />
            <Boat />
            <Waterfall />
          </Physics>
        </KeyboardControls>
      </Canvas>
    </>
  )
}
