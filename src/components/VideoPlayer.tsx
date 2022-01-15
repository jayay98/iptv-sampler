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
  const videoNodeRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const sourceRef = useRef<MediaElementAudioSourceNode>()
  const audioCtxRef = useRef<AudioContext>(new AudioContext())
  // const audioNodeRef = useRef<HTMLAudioElement>(null);
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const addAudioUrl = (url: string) => {
    setAudioUrls([...audioUrls, url])
  }

  // const md = new MediaRecorder()

  let CurY: number
  const HEIGHT = window.innerHeight
  const panNode = audioCtxRef.current.createStereoPanner()
  const recordingStream = audioCtxRef.current.createMediaStreamDestination()
  const recorder = new MediaRecorder(recordingStream.stream)

  function updatePage (e: MouseEvent) {
    CurY = (window.Event) ? e.pageY : e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)

    // gainNode.gain.value = CurY/HEIGHT;
    panNode.pan.value = (CurY / (HEIGHT / 2)) - 1
  }
  document.onmousemove = updatePage

  function startrecording () {
    sourceRef.current?.connect(recordingStream)
    recorder.start()
  }

  function stoprecording () {
    recorder.addEventListener('dataavailable', function (e) {
      // audioNodeRef.current!.src = URL.createObjectURL(e.data);
      const url = URL.createObjectURL(e.data)
      addAudioUrl(url)
      console.log(audioUrls)
    })
    recorder.stop()
  }

  useEffect(
    () => {
      if (videoNodeRef.current) {
        if (sourceRef.current == null) {
          sourceRef.current = audioCtxRef.current.createMediaElementSource(videoNodeRef.current as HTMLMediaElement)
        }
        sourceRef.current.connect(audioCtxRef.current.destination)
        // panNode.connect(audioCtxRef.current.destination);
      }
      return () => {
        console.log('disconnect')
        sourceRef.current?.disconnect()
        // panNode.disconnect();
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
    }, [options]
  )

  return (
        <>
            <video ref={videoNodeRef} className='video-js vjs-big-play-centered' id='playerElement' />
            {/* <audio controls ref={audioNodeRef} /> */}
            {audioUrls.map((url, i) => (
                <audio controls src={url} key={`audio-${i}`}/>
            ))}
            <Button onClick={startrecording}>Start</Button>
            <Button onClick={stoprecording}>End</Button>
        </>
  )
}

export default VideoPlayer
