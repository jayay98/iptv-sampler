// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { Button } from '@mui/material'

interface IVideoPlayerProps {
    options: videojs.PlayerOptions;
}

const initialOptions: videojs.PlayerOptions = {
  controls: true,
  fluid: true,
  controlBar: {
    volumePanel: {
      inline: false
    }
  }
}

const VideoPlayer: React.FC<IVideoPlayerProps> = ({ options }) => {
  // References For Video Player
  const videoNodeRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playerRef = useRef<videojs.Player>()

  const sourceRef = useRef<MediaElementAudioSourceNode>()
  const audioCtxRef = useRef<AudioContext>(new AudioContext())
  const canvasCtxRef = useRef<CanvasRenderingContext2D>()
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const addAudioUrl = (url: string) => {
    setAudioUrls([...audioUrls, url])
  }

  const analyser = audioCtxRef.current.createAnalyser()
  analyser.fftSize = 256
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteTimeDomainData(dataArray)

  const recordingStream = audioCtxRef.current.createMediaStreamDestination()
  const recorder = new MediaRecorder(recordingStream.stream)

  function startrecording () {
    sourceRef.current?.connect(recordingStream)
    recorder.start()
  }

  function stoprecording () {
    recorder.addEventListener('dataavailable', function (e) {
      const url = URL.createObjectURL(e.data)
      addAudioUrl(url)
    })
    recorder.stop()
  }

  // Update sourceRef
  useEffect(
    () => {
      if (videoNodeRef.current) {
        if (sourceRef.current == null) {
          sourceRef.current = audioCtxRef.current.createMediaElementSource(videoNodeRef.current as HTMLMediaElement)
          console.log('MediaElementSourceNode created')
        }
        sourceRef.current.connect(audioCtxRef.current.destination)
        sourceRef.current.connect(analyser)
        console.log('MediaElementSourceNode connected to destination')
      }

      if (canvasRef.current) {
        canvasCtxRef.current = canvasRef.current.getContext('2d')!
        draw(canvasCtxRef.current)
      }

      return () => {
        console.log('disconnect')
        sourceRef.current?.disconnect()
      }
    }
  )

  useEffect(
    () => {
      if (!playerRef.current) {
        const videoElement = videoNodeRef.current
        if (!videoElement) { return }

        playerRef.current = videojs(videoElement, {
          ...initialOptions,
          ...options
        })
      } else {
        const player = playerRef.current
        player.autoplay(true)
        player.src(options.sources!)
      }

      if (canvasRef.current) {
        draw(canvasRef.current.getContext('2d')!)
      }
    }, [options]
  )

  function draw (canvasCtx: CanvasRenderingContext2D) {
    const WIDTH = canvasRef.current!.width
    const HEIGHT = canvasRef.current!.height
    requestAnimationFrame(() => draw(canvasCtx))

    analyser.getByteFrequencyData(dataArray)

    canvasCtx.fillStyle = 'rgb(0, 0, 0)'
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

    const barWidth = (WIDTH / bufferLength) * 2.5
    let barHeight: number
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2

      canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)'
      canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight)

      x += barWidth + 1
    }
  }

  return (
        <>
            <video ref={videoNodeRef} className='video-js vjs-big-play-centered' id='playerElement' />
            <canvas ref={canvasRef} style={{ width: 500, height: 500 }}/>
            {audioUrls.map((url, i) => (
              <>
                <audio controls src={url} key={`audio-${i}`}/>
                <a href={url} download={`${i}.ogg`}>Download</a>
              </>
            ))}
            <Button onClick={startrecording}>Start</Button>
            <Button onClick={stoprecording}>End</Button>
        </>
  )
}

export default VideoPlayer
