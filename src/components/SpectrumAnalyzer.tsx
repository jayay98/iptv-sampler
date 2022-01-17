// eslint-disable-next-line no-use-before-define
import React, { useEffect } from 'react'

interface ISpectrumAnalyserProps {
    analyserRef: React.MutableRefObject<AnalyserNode>
    canvasRef: React.RefObject<HTMLCanvasElement>
}

const SpectrumAnalyzer: React.FC<ISpectrumAnalyserProps> = ({ canvasRef, analyserRef }) => {
  const bufferLength = analyserRef.current.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  function draw (canvasCtx: CanvasRenderingContext2D) {
    const WIDTH = canvasRef.current!.width
    const HEIGHT = canvasRef.current!.height
    requestAnimationFrame(() => draw(canvasCtx))

    analyserRef.current.getByteFrequencyData(dataArray)

    canvasCtx.fillStyle = 'rgb(0, 0, 0)'
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

    const barWidth = (WIDTH / bufferLength) * 2.5
    let barHeight: number
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2

      canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',' + x + ',50)'
      canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight)

      x += barWidth + 1
    }
  }

  useEffect(
    () => {
      if (canvasRef.current) {
        draw(canvasRef.current.getContext('2d')!)
      }
    }, []
  )

  return (
        <canvas ref={canvasRef} style={{ width: '50%' }} />
  )
}

export default SpectrumAnalyzer
