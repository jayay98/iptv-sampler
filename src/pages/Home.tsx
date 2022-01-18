// eslint-disable-next-line no-use-before-define
import React, { useState, useRef } from 'react'
import videojs from 'video.js'
import VideoPlayer from '../components/VideoPlayer'
import ChannelsList from '../components/ChannelsList'
import { Box, Drawer, Container, Stack, AppBar, Toolbar, IconButton, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import WaveformVisualiser from '../components/WaveformVisualizer'
import SpectrumAnalyzer from '../components/SpectrumAnalyzer'
import AudioArchives from '../components/AudioArchives'
import GainPanel from '../components/AudioEffects/GainPanel'
import StereoPannerPanel from '../components/AudioEffects/StereoPannerPanel'
import DynamicCompressorPanel from '../components/AudioEffects/DynamicsCompresserPanel'
import BiquadFilterPanel from '../components/AudioEffects/BiquadFilterPanel'

const Home: React.FC<{}> = () => {
  const [drawerState, setDrawerState] = useState(false)
  const [vidOptions, setVidOptions] = useState<videojs.PlayerOptions>({ sources: [] }) // States for audio outputs
  const [audioUrls, setAudioUrls] = useState<string[]>([])

  const audioCtxRef = useRef<AudioContext>(new AudioContext())
  const bufferRef = useRef(audioCtxRef.current.createGain())
  bufferRef.current.connect(audioCtxRef.current.destination)

  // References For Waveform visualizer
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode>(audioCtxRef.current.createAnalyser())

  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const originalWaveformCanvasRef = useRef<HTMLCanvasElement>(null)
  const originalAnalyserRef = useRef<AnalyserNode>(audioCtxRef.current.createAnalyser())
  const mediaSrcRef = useRef<MediaElementAudioSourceNode>()
  const pannerRef = useRef<StereoPannerNode>(audioCtxRef.current.createStereoPanner())
  const compressorRef = useRef<DynamicsCompressorNode>(audioCtxRef.current.createDynamicsCompressor())
  const filterRef = useRef<BiquadFilterNode>(audioCtxRef.current.createBiquadFilter())

  // TODO - show these only when the video is playing (as a monitor)
  analyserRef.current.fftSize = 256
  originalAnalyserRef.current.fftSize = 256

  const effects: React.MutableRefObject<AudioNode>[] = [filterRef, compressorRef, pannerRef, bufferRef, analyserRef]
  effects.forEach((effect, i) => {
    if (i !== effects.length - 1) {
      effects[i].current.connect(effects[i + 1].current)
    }
  })
  mediaSrcRef.current?.connect(originalAnalyserRef.current)

  const setVideoSrc = (src: string) => {
    setVidOptions(
      {
        sources: [
          {
            src,
            type: 'application/x-mpegURL'
          }
        ]
      }
    )
  }

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sampler
          </Typography>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={(event) => setDrawerState(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Stack
        justifyContent={'space-around'}
        alignItems={'center'}
        spacing={2}
      >
        <Container sx={{ width: 0.5, margin: 5 }}>
          <VideoPlayer
            options={vidOptions}
            audioContext={audioCtxRef}
            bufferRef={pannerRef}
            onRecCompleted={(url: string) => setAudioUrls([...audioUrls, url])}
            mediaSrcRef={mediaSrcRef}
          />
        </Container>
        <Container sx={{ width: 0.5, margin: 5 }}>
          <SpectrumAnalyzer analyserRef={originalAnalyserRef} canvasRef={originalCanvasRef} />
          <WaveformVisualiser analyserRef={originalAnalyserRef} canvasRef={originalWaveformCanvasRef} />
          <Typography variant={'subtitle1'}>from video source</Typography>
        </Container>
        <Container sx={{ width: 0.5, margin: 5 }}>
          <SpectrumAnalyzer analyserRef={analyserRef} canvasRef={canvasRef} />
          <WaveformVisualiser analyserRef={analyserRef} canvasRef={waveformCanvasRef} />
          <Typography variant={'subtitle1'}>from output</Typography>
        </Container>

        <Stack direction={'row'} sx={{ margin: 5 }} spacing={3}>
          <BiquadFilterPanel filterRef={filterRef} />
          <DynamicCompressorPanel compressorRef={compressorRef} />
          <StereoPannerPanel stereoPannerRef={pannerRef} />
          <GainPanel gainRef={bufferRef}/>
        </Stack>

        <AudioArchives
          audioUrls={audioUrls}
          onPlayCb={(id: string) => {
            audioCtxRef.current.createMediaElementSource(document.querySelector('audio#' + id)! as HTMLAudioElement).connect(
              bufferRef.current
            )
          }}
          onPauseCb={(id: string) => {
            bufferRef.current.disconnect()
            bufferRef.current.connect(audioCtxRef.current.destination)
            bufferRef.current.connect(analyserRef.current)
          }}
        />
      </Stack>

      <Drawer
        anchor={'right'}
        open={drawerState}
        onClose={(event) => setDrawerState(false)}
      >
        <Box>
          <ChannelsList onItemClick={setVideoSrc} />
        </Box>
      </Drawer>
    </>
  )
}

export default Home
