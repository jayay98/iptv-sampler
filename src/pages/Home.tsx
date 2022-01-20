// eslint-disable-next-line no-use-before-define
import React, { useState, useRef, useEffect } from 'react'
import { Sampler } from 'tone'
import videojs from 'video.js'
import VideoPlayer from '../components/VideoPlayer'
import ChannelsList from '../components/ChannelsList'
import { Box, Drawer, Container, Stack, AppBar, Toolbar, IconButton, Typography, Snackbar, Grid, Tab, Tabs, Badge, List, ListItem, Collapse, ListItemButton, ListItemText } from '@mui/material'
import { Equalizer, Insights, AudioFile, Close, Menu as MenuIcon, ExpandLess, ExpandMore } from '@mui/icons-material'
import WaveformPlot from '../components/WaveformPlot'
import SpectrumAnalyzer from '../components/SpectrumAnalyzer'
import AudioArchives from '../components/AudioArchives'
import GainPanel from '../components/AudioEffects/GainPanel'
import StereoPannerPanel from '../components/AudioEffects/StereoPannerPanel'
import DynamicCompressorPanel from '../components/AudioEffects/DynamicsCompresserPanel'
import BiquadFilterPanel from '../components/AudioEffects/BiquadFilterPanel'
import SamplerModal from '../components/SamplerModal'

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

const fromAudioUrls = (audioUrls: {audio: string, time: Date}[]) => {
  if (audioUrls.length === 0) {
    return {}
  }
  const keys = [...new Array(audioUrls.length)].map((_, i) => `A${i}`)
  const sources = Object.fromEntries(keys.map((key, i) => [key, audioUrls[i].audio]))
  console.log(sources)
  return sources
}

const Home: React.FC<{}> = () => {
  const [drawerState, setDrawerState] = useState(false)
  const [vidOptions, setVidOptions] = useState<videojs.PlayerOptions>({ sources: [] }) // States for audio outputs
  const [audioUrls, setAudioUrls] = useState<{ audio: string, time: Date }[]>([])
  const [isSnackOpen, setSnackOpen] = useState(false)
  const [isSamplerLoaded, setSamplerLoaded] = useState(false)
  const [tab, setTab] = React.useState(0)
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  const audioCtxRef = useRef<AudioContext>(new AudioContext())
  const bufferRef = useRef(audioCtxRef.current.createGain())
  bufferRef.current.connect(audioCtxRef.current.destination)
  const samplerRef = useRef<Sampler>(new Sampler(fromAudioUrls(audioUrls), {
    onload: () => {
      console.log('Sampler Loaded')
      setSamplerLoaded(true)
    }
  }))
  useEffect(() => {
    samplerRef.current = new Sampler(fromAudioUrls(audioUrls))
    samplerRef.current.toDestination()
  }, [audioUrls])

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
  const [panelOpen, setPanelOpen] = useState<boolean[]>([...new Array(effects.length - 1)].map((i) => false))
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
      <Close fontSize="small" />
    </IconButton>
  )

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Random IPTV Sampler
          </Typography>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={(event) => setDrawerState(true)}
            about={'channels'}
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
                <Tab icon={<Equalizer />} {...a11yProps(0)} />
                <Tab icon={<Insights />} {...a11yProps(1)} />
                <Tab icon={<Badge badgeContent={audioUrls.length}><AudioFile /></Badge>} {...a11yProps(2)} />
              </Tabs>
            </Box>
            <TabPanel value={tab} index={0}>
              <List>
                {
                  [
                    <BiquadFilterPanel key={'Biquad Filter'} filterRef={filterRef} />,
                    <DynamicCompressorPanel key={'Dynamic Compressor'} compressorRef={compressorRef} />,
                    <StereoPannerPanel key={'Pan'} stereoPannerRef={pannerRef} />,
                    <GainPanel key={'Gain'} gainRef={bufferRef} />
                  ].map((el, i) => (
                    <>
                      <ListItemButton
                        onClick={() => {
                          const open = panelOpen[i]
                          const newArr = panelOpen.slice(0)
                          newArr[i] = !open
                          setPanelOpen(newArr)
                        }}
                      >
                        <ListItemText primary={el.key} />
                        {panelOpen[i] ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>
                      <Collapse key={i} in={panelOpen[i]} timeout="auto" unmountOnExit>
                        <ListItem>
                          {el}
                        </ListItem>
                      </Collapse>
                    </>
                  ))
                }
              </List>
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <Stack direction={'column'} alignItems={'center'} justifyContent={'space-around'}>
                <SpectrumAnalyzer analyserRef={originalAnalyserRef} canvasRef={originalCanvasRef} />
                <WaveformPlot analyserRef={originalAnalyserRef} canvasRef={originalWaveformCanvasRef} />
                <Typography variant={'subtitle1'}>from video source</Typography>
                <SpectrumAnalyzer analyserRef={analyserRef} canvasRef={canvasRef} />
                <WaveformPlot analyserRef={analyserRef} canvasRef={waveformCanvasRef} />
                <Typography variant={'subtitle1'}>from output</Typography>
              </Stack>
            </TabPanel>
            <TabPanel value={tab} index={2}>
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
                onRecCompleted={(url: string) => {
                  setAudioUrls([...audioUrls, { audio: url, time: new Date(Date.now()) }])
                  setSnackOpen(true)
                }}
                mediaSrcRef={mediaSrcRef}
              />
            </Container>
            <SamplerModal audioUrls={audioUrls.map((obj) => obj.audio)} samplerRef={samplerRef} isSamplerLoaded={isSamplerLoaded} />
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
