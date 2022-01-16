// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { Button, TableRow, TableCell, TableHead, Table, TableBody } from '@mui/material'

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
  // References For Audio elements
  const audioCtxRef = useRef<AudioContext>(new AudioContext())
  const sourceRef = useRef<MediaElementAudioSourceNode>()
  // References For Waveform visualizer
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasCtxRef = useRef<CanvasRenderingContext2D>()
  // References For Video Player
  const videoNodeRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  // States for audio outputs
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

  function startRecording () {
    sourceRef.current?.connect(recordingStream)
    recorder.start()
  }

  function stopRecording () {
    recorder.addEventListener('dataavailable', function (e) {
      const url = URL.createObjectURL(e.data)
      addAudioUrl(url)
    })
    recorder.stop()
  }

  /**
   * Audio block
   * This block will only take effect once
   * It links all the audio node and canvas in React ref
   * TODO - link nodes dynamically
   */
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

  /**
   * The video player will switch src everytime the options is changed
   */
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

  /**
   * Canvas Draw function
   * TODO - consider isolate this
   * @param canvasCtx
   */
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

      canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',' + x + ',50)'
      canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight)

      x += barWidth + 1
    }
  }

  return (
    <>
      <video ref={videoNodeRef} className='video-js vjs-big-play-centered' id='playerElement' />
      <canvas ref={canvasRef} style={{ width: '50%' }} />
      <br />
      <Button onClick={startRecording}>Start</Button>
      <Button onClick={stopRecording}>End</Button>
      <br />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='left'>Audio</TableCell>
            <TableCell align='left'>Download</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {audioUrls.map((url, i) => (
            <>
              <TableCell><audio controls src={url} key={`audio-${i}`} /></TableCell>
              <TableCell><a href={url} download={`${i}.ogg`}>Download</a></TableCell>
            </>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default VideoPlayer
