import { useFrame, useThree } from '@react-three/fiber'
import { folder, useControls } from 'leva'
import React, { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import * as THREE from 'three'
import { clamp, lerp, map, roundTo } from '@/utils/math'
import { useStore } from '@/store'

interface WaterfallMixSnapshot {
  gain: number
  reverb: {
    decay: number
    wet: number
  }
  filter: {
    frequency: number
  }
}

const WATERFALL_MIX: { min: WaterfallMixSnapshot; max: WaterfallMixSnapshot } = {
  min: {
    gain: 0.2,
    reverb: {
      decay: 1,
      wet: 0.2,
    },
    filter: {
      frequency: 320,
    },
  },
  max: {
    gain: 0.3,
    reverb: {
      decay: 10,
      wet: 0.1,
    },
    filter: {
      frequency: 5000,
    },
  },
}

export interface AudioMixNodes {
  masterGain: Tone.Gain<'gain'>
  waterfallPlayer: Tone.Player
  waterfallGain: Tone.Gain<'gain'>
  waterfallReverb: Tone.Reverb
  waterfallFilter: Tone.Filter
  motorboatPlayer: Tone.Player
  motorboatGain: Tone.Gain
  wavesPlayer: Tone.Player
  wavesGain: Tone.Gain
}

export const AudioMix = () => {
  const hasUserInteracted = useStore((state) => state.hasUserInteracted)
  const setAudioMixNodes = useStore((state) => state.setAudioMixNodes)
  const isMuted = useStore((state) => state.isMuted)

  useEffect(() => {
    Tone.Destination.mute = isMuted
  }, [isMuted])

  const [nodes] = React.useState<AudioMixNodes>(() => {
    return {
      masterGain: new Tone.Gain(0),
      waterfallPlayer: new Tone.Player({
        url: '/audio/waterfall.mp3',
        loop: true,
        autostart: true,
      }),
      waterfallGain: new Tone.Gain(0.5),
      waterfallReverb: new Tone.Reverb({
        decay: 1,
        wet: 0.2,
      }),
      waterfallFilter: new Tone.Filter(320, 'lowpass'),
      motorboatPlayer: new Tone.Player({
        url: '/audio/motorboat.mp3',
        loop: true,
        autostart: true,
      }),
      motorboatGain: new Tone.Gain(0.0),
      wavesPlayer: new Tone.Player({
        url: '/audio/waves.mp3',
        loop: true,
        autostart: true,
      }),
      wavesGain: new Tone.Gain(0.02),
    }
  })

  useEffect(() => {
    setAudioMixNodes(nodes)
  }, [nodes, setAudioMixNodes])

  useControls('Audio', {
    master: {
      value: 0,
      min: 0,
      max: 1,
      step: 0.1,
      onChange: (value) => {
        nodes.masterGain.gain.value = value
      },
    },
    waterfall: folder({
      wtflgain: {
        value: nodes.waterfallGain.gain.value as number,
        min: 0,
        max: 1,
        step: 0.1,
        onChange: (value) => {
          nodes.waterfallGain.gain.value = value
        },
      },
      reverb: folder({
        decay: {
          value: nodes.waterfallReverb.decay as number,
          min: 0,
          max: 10,
          step: 0.1,
          onChange: (value) => {
            nodes.waterfallReverb.decay = value
          },
        },
        wet: {
          value: 0.2 as unknown as number,
          min: 0,
          max: 1,
          step: 0.1,
          onChange: (value) => {
            nodes.waterfallReverb.set({
              wet: value,
            })
          },
        },
      }),
      filter: folder({
        frequency: {
          value: nodes.waterfallFilter.frequency.value as number,
          min: 0,
          max: 20000,
          step: 10,
          onChange: (value) => {
            nodes.waterfallFilter.frequency.value = value
          },
        },
      }),
    }),
    motorboat: folder({
      mbgain: {
        value: nodes.motorboatGain.gain.value as number,
        min: 0,
        max: 1,
        step: 0.1,
        onChange: (value) => {
          nodes.motorboatGain.gain.value = value
        },
      },
    }),
    waves: folder({
      wgain: {
        value: nodes.wavesGain.gain.value as number,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => {
          nodes.wavesGain.gain.value = value
        },
      },
    }),
  })

  useEffect(() => {
    const {
      masterGain,
      waterfallReverb,
      waterfallFilter,
      waterfallPlayer,
      waterfallGain,
      motorboatGain,
      motorboatPlayer,
      wavesPlayer,
      wavesGain,
    } = nodes
    waterfallPlayer.chain(waterfallGain, waterfallFilter, waterfallReverb, masterGain, Tone.Destination)

    motorboatPlayer.chain(motorboatGain, masterGain, Tone.Destination)

    wavesPlayer.chain(wavesGain, masterGain, Tone.Destination)
  }, [])

  useEffect(() => {
    if (!nodes) return

    const init = async () => {
      await Tone.start()
      nodes.masterGain.gain.exponentialRampTo(0.5, 1)
    }
    if (hasUserInteracted) {
      init()
    } else {
      Tone.Transport.stop()
    }
  }, [hasUserInteracted, nodes])

  const scene = useThree((state) => state.scene)
  const [DUMMY_VECTOR] = useState(() => new THREE.Vector3())
  const boatDistanceToWaterfallPercentage = useRef(0)

  useFrame(() => {
    const boat = scene.getObjectByName('BOAT')
    const waterfall = scene.getObjectByName('WATERFALL')

    if (boat && waterfall) {
      const worldPosition = boat.getWorldPosition(DUMMY_VECTOR)
      const boatDistanceToWaterfall = worldPosition.distanceTo(waterfall.position)
      const _boatDistanceToWaterfall = roundTo(clamp(map(boatDistanceToWaterfall, 25, 10, 0, 1), 0, 1), 1)

      if (_boatDistanceToWaterfall !== boatDistanceToWaterfallPercentage.current) {
        boatDistanceToWaterfallPercentage.current = _boatDistanceToWaterfall

        const waterfallGainValue = lerp(
          WATERFALL_MIX.min.gain,
          WATERFALL_MIX.max.gain,
          boatDistanceToWaterfallPercentage.current,
        )
        nodes.waterfallGain.gain.exponentialRampTo(waterfallGainValue, 1)

        const waterfallReverbWetValue = lerp(
          WATERFALL_MIX.min.reverb.wet,
          WATERFALL_MIX.max.reverb.wet,
          boatDistanceToWaterfallPercentage.current,
        )
        nodes.waterfallReverb.set({
          wet: waterfallReverbWetValue,
        })

        const waterfallFilterFrequencyValue = lerp(
          WATERFALL_MIX.min.filter.frequency,
          WATERFALL_MIX.max.filter.frequency,
          boatDistanceToWaterfallPercentage.current,
        )
        nodes.waterfallFilter.frequency.exponentialRampTo(waterfallFilterFrequencyValue, 2)
      }
    }
  })

  return null
}
