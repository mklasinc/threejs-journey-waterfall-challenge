import { EffectComposer, Noise } from '@react-three/postprocessing'

export const Effects = () => {
  return (
    <EffectComposer>
      <Noise opacity={0.8} premultiply />
      <Noise opacity={0.01} />
    </EffectComposer>
  )
}
