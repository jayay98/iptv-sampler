// eslint-disable-next-line no-use-before-define
import React from 'react'
import { Circle } from '@mui/icons-material'
import styled, { keyframes } from 'styled-components'

const blinkingEffect = keyframes`
50% {
  opacity: 0;
}
`

const AnimatedComponent = styled.div`
  animation: ${blinkingEffect} 1s linear infinite;
  display: inline
`

interface IRecordingStatusProps {
    isRecording: boolean
}

const RecordingStatus: React.FC<IRecordingStatusProps> = ({ isRecording }) => {
  return (
      <>
        { isRecording && <AnimatedComponent><Circle style={ { fill: 'darkred' } } /></AnimatedComponent> }
      </>
  )
}

export default RecordingStatus
