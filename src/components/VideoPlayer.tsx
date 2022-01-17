// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { Button } from '@mui/material'
import SpectrumAnalyzer from './SpectrumAnalyzer'
import AudioArchives from './AudioArchives'

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
    }, [options]
  )

  return (
    <>
      <video ref={videoNodeRef} className='video-js vjs-big-play-centered' id='playerElement' />
      <SpectrumAnalyzer analyser={analyser} canvasRef={canvasRef}/>
      <br />
      <Button onClick={startRecording}>Start</Button>
      <Button onClick={stopRecording}>End</Button>
      <br />
      <AudioArchives audioUrls={audioUrls} />
    </>
  )
}

export default VideoPlayer
