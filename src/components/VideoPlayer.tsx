// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, createRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { Button } from '@mui/material'

interface IVideoPlayerProps {
  options: videojs.PlayerOptions;
  audioContext: React.MutableRefObject<AudioContext>
  bufferRef: React.MutableRefObject<GainNode>
  mediaSrcRef?: React.MutableRefObject<MediaElementAudioSourceNode | undefined>
  onRecCompleted: (url: string) => void
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

const VideoPlayer: React.FC<IVideoPlayerProps> = ({ options, audioContext, bufferRef, onRecCompleted, mediaSrcRef }) => {
  // References For Video Player
  const videoNodeRef = createRef<HTMLVideoElement>()
  const mediaSourceRef = mediaSrcRef || useRef<MediaElementAudioSourceNode>()
  const playerRef = useRef<videojs.Player>()

  const recordingStream = audioContext.current.createMediaStreamDestination()
  const recorder = new MediaRecorder(recordingStream.stream)
  const startRecording = () => {
    bufferRef.current.connect(recordingStream)
    recorder.start()
  }
  const stopRecording = () => {
    recorder.addEventListener('dataavailable', (e) => {
      const url = URL.createObjectURL(e.data)
      onRecCompleted(url)
    })
    recorder.stop()
    bufferRef.current.disconnect(recordingStream)
  }

  /**
   * Audio block
   * This block will only take effect once
   * It links all the audio node and canvas in React ref
   * TODO - link nodes dynamically
   */
  useEffect(
    () => {
      // Only executed in the beiginning
      if (mediaSourceRef.current == null) {
        mediaSourceRef.current = audioContext.current.createMediaElementSource(videoNodeRef.current as HTMLMediaElement)
        console.log('MediaElementSourceNode created')
      }
    }
  )

  useEffect(
    () => {
      if (mediaSourceRef.current) {
        mediaSourceRef.current.connect(bufferRef.current)
        console.log('MediaElementSourceNode connected to destination')
      }

      return () => {
        console.log('disconnect')
        mediaSourceRef.current?.disconnect(bufferRef.current)
      }
    }, [mediaSourceRef]
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
      <br />
      <Button onClick={startRecording}>Start</Button>
      <Button onClick={stopRecording}>End</Button>
    </>
  )
}

export default VideoPlayer
