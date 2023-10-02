import React from 'react'
import { GeistProvider, CssBaseline, Keyboard, Text } from '@geist-ui/core'
import { Html } from '@react-three/drei'
import { useStore } from '@/store'
import cx from 'clsx'
import { FaVolumeHigh, FaVolumeXmark } from 'react-icons/fa6'

export const UI = () => {
  const hasUserInteracted = useStore((state) => state.hasUserInteracted)

  const isMuted = useStore((state) => state.isMuted)
  const toggleIsMuted = useStore((state) => state.toggleIsMuted)

  return (
    <GeistProvider>
      <CssBaseline />
      <div
        id="instructions"
        className={cx(
          'absolute top-0 left-0 w-full h-full pointer-events-none transition-opacity duration-[1000ms] z-10',
          hasUserInteracted && 'opacity-0',
        )}
      >
        <div className={'absolute bottom-[10%] left-[50%] translate-x-[-50%]'}>
          <div className="relative flex justify-center z-10">
            <Keyboard mb="10px">⬆</Keyboard>
          </div>
          <div className="relative flex justify-center z-10">
            <Keyboard mr="10px">⬅</Keyboard>
            <Keyboard>⬇</Keyboard>
            <Keyboard ml="10px">⮕</Keyboard>
          </div>
          <Text className="text-center">
            <span className="text-white">Use arrow keys to move around</span>
          </Text>
        </div>
      </div>
      <div
        className={cx(
          'absolute bottom-[50px] right-[50px] transition-opacity duration-[500ms] opacity-0',
          hasUserInteracted && 'opacity-100',
        )}
      >
        <button
          className="pointer-events-auto bg-transparent border-none outline-none focus:outline-none cursor-pointer"
          onClick={toggleIsMuted}
        >
          {isMuted ? (
            <FaVolumeXmark className="text-white text-2xl" />
          ) : (
            <FaVolumeHigh className="text-white text-2xl" />
          )}
        </button>
      </div>
    </GeistProvider>
  )
}
