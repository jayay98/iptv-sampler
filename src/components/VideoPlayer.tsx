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
  const [sourceRef, setSourceRef] = useState<MediaElementAudioSourceNode>()
  const setMediaAsSrc = (el: HTMLMediaElement) => {
    setSourceRef(audioCtxRef.current.createMediaElementSource(el))
  }

  // References For Waveform visualizer
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode>(audioCtxRef.current.createAnalyser())
  analyserRef.current.fftSize = 256
  // References For Video Player
  const videoNodeRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  // States for audio outputs
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const addAudioUrl = (url: string) => {
    setAudioUrls([...audioUrls, url])
  }

  const recordingStream = audioCtxRef.current.createMediaStreamDestination()
  const recorder = new MediaRecorder(recordingStream.stream)
  const startRecording = () => {
    sourceRef?.connect(recordingStream)
    recorder.start()
  }
  const stopRecording = () => {
    recorder.addEventListener('dataavailable', (e) => {
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
        // Only executed in the beiginning
        if (sourceRef == null) {
          setMediaAsSrc(videoNodeRef.current as HTMLMediaElement)
          console.log('MediaElementSourceNode created')
        }
      }
    }
  )

  useEffect(
    () => {
      if (sourceRef) {
        sourceRef.connect(audioCtxRef.current.destination)
        sourceRef.connect(analyserRef.current)
        console.log('MediaElementSourceNode connected to destination')
      }

      return () => {
        console.log('disconnect')
        sourceRef?.disconnect()
      }
    }, [sourceRef]
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
      <SpectrumAnalyzer analyserRef={analyserRef} canvasRef={canvasRef} />
      <br />
      <Button onClick={startRecording}>Start</Button>
      <Button onClick={stopRecording}>End</Button>
      <br />
      <AudioArchives
        audioUrls={audioUrls}
        onPlayCb={
          (id: string) => {
            setMediaAsSrc(document.querySelector('audio#' + id)! as HTMLAudioElement)
          }
        }
        onPauseCb={
          (id: string) => {
            setMediaAsSrc(videoNodeRef.current as HTMLMediaElement)
          }
        }
      />
    </>
  )
}

export default VideoPlayer
