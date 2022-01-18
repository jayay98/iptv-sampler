// eslint-disable-next-line no-use-before-define
import React from 'react'

interface IWaveformVisualizerProps {
    analyserRef: React.MutableRefObject<AnalyserNode>
    canvasRef: React.RefObject<HTMLCanvasElement>
}

const WaveformVisualiser: React.FC<IWaveformVisualizerProps> = ({ canvasRef, analyserRef }) => {
  const bufferLength = analyserRef.current.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  function draw (canvasCtx: CanvasRenderingContext2D) {
    const WIDTH = canvasRef.current!.width
    const HEIGHT = canvasRef.current!.height
    requestAnimationFrame(() => draw(canvasCtx))

    analyserRef.current.getByteTimeDomainData(dataArray)

    canvasCtx.fillStyle = 'rgb(0, 0, 0)'
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

    canvasCtx.fillStyle = 'rgb(200, 200, 200)'
    canvasCtx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)

    canvasCtx.lineWidth = 2
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)'

    canvasCtx.beginPath()

    const sliceWidth = canvasRef.current!.width * 1.0 / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = v * canvasRef.current!.height / 2

      if (i === 0) {
        canvasCtx.moveTo(x, y)
      } else {
        canvasCtx.lineTo(x, y)
      }

      x += sliceWidth
    }

    canvasCtx.lineTo(canvasRef.current!.width, canvasRef.current!.height / 2)
    canvasCtx.stroke()
  }

  React.useEffect(
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

export default WaveformVisualiser
