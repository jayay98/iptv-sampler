// eslint-disable-next-line no-use-before-define
import React, { useState, useRef } from 'react'
import videojs from 'video.js'
import VideoPlayer from '../components/VideoPlayer'
import ChannelsList from '../components/ChannelsList'
import { Box, Drawer, Container, Stack, AppBar, Toolbar, IconButton, Typography, Snackbar, Grid, Tab, Tabs } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import InsightsIcon from '@mui/icons-material/Insights'
import AudioFileIcon from '@mui/icons-material/AudioFile'
import WaveformPlot from '../components/WaveformPlot'
import SpectrumAnalyzer from '../components/SpectrumAnalyzer'
import AudioArchives from '../components/AudioArchives'
import GainPanel from '../components/AudioEffects/GainPanel'
import StereoPannerPanel from '../components/AudioEffects/StereoPannerPanel'
import DynamicCompressorPanel from '../components/AudioEffects/DynamicsCompresserPanel'
import BiquadFilterPanel from '../components/AudioEffects/BiquadFilterPanel'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel (props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box sx={{ p: 3 }}>
        <Typography>{children}</Typography>
      </Box>
    </div>
  )
}

function a11yProps (index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

const Home: React.FC<{}> = () => {
  const [drawerState, setDrawerState] = useState(false)
  const [vidOptions, setVidOptions] = useState<videojs.PlayerOptions>({ sources: [] }) // States for audio outputs
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [isSnackOpen, setSnackOpen] = useState(false)
  const [tab, setTab] = React.useState(0)
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

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
  filterRef.current.type = 'allpass'

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

  const handleSnackClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackOpen(false)
  }

  const snackAction = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleSnackClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  )

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

      <Grid container spacing={2}>

        <Grid item xs={4}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab icon={<InsightsIcon />} {...a11yProps(0)} />
                <Tab icon={<AudioFileIcon />} {...a11yProps(1)} />
              </Tabs>
            </Box>
            <TabPanel value={tab} index={0}>
              <Stack direction={'column'} alignItems={'center'} justifyContent={'space-around'}>
                <SpectrumAnalyzer analyserRef={originalAnalyserRef} canvasRef={originalCanvasRef} />
                <WaveformPlot analyserRef={originalAnalyserRef} canvasRef={originalWaveformCanvasRef} />
                <Typography variant={'subtitle1'}>from video source</Typography>
                <SpectrumAnalyzer analyserRef={analyserRef} canvasRef={canvasRef} />
                <WaveformPlot analyserRef={analyserRef} canvasRef={waveformCanvasRef} />
                <Typography variant={'subtitle1'}>from output</Typography>
              </Stack>
            </TabPanel>
            <TabPanel value={tab} index={1}>
              Audio Archives
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
            </TabPanel>
          </Box>
        </Grid>

        <Grid item xs={8}>
          <Stack
            justifyContent={'space-around'}
            alignItems={'center'}
            spacing={2}
          >
            <Container sx={{ margin: 5 }}>
              <VideoPlayer
                options={vidOptions}
                audioContext={audioCtxRef}
                bufferRef={pannerRef}
                onRecCompleted={(url: string) => { setAudioUrls([...audioUrls, url]); setSnackOpen(true) }}
                mediaSrcRef={mediaSrcRef}
              />
            </Container>
            <Stack direction={'row'} sx={{ margin: 5 }} spacing={3}>
              <BiquadFilterPanel filterRef={filterRef} />
              <DynamicCompressorPanel compressorRef={compressorRef} />
              <StereoPannerPanel stereoPannerRef={pannerRef} />
              <GainPanel gainRef={bufferRef} />
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Drawer
        anchor={'right'}
        open={drawerState}
        onClose={(event) => setDrawerState(false)}
      >
        <Box>
          <ChannelsList onItemClick={setVideoSrc} />
        </Box>
      </Drawer>

      <Snackbar
        open={isSnackOpen}
        autoHideDuration={3000}
        message="Sample Recorded"
        onClose={handleSnackClose}
        action={snackAction}
      />
    </>
  )
}

export default Home
