// eslint-disable-next-line no-use-before-define
import React, { useState } from 'react'
import videojs from 'video.js'
import VideoPlayer from '../components/VideoPlayer'
import ChannelsList from '../components/ChannelsList'
import { Box, Drawer, Container, Stack, AppBar, Toolbar, IconButton, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

const Home: React.FC<{}> = () => {
  const [drawerState, setDrawerState] = useState(false)
  const [vidOptions, setVidOptions] = React.useState<videojs.PlayerOptions>({
    sources: [
      // {
      //     src: "https://cdn.hkdtmb.com/hls/99/index.m3u8",
      //     type: 'application/x-mpegURL'
      // }
    ]
  })

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
          <VideoPlayer options={vidOptions} />
        </Container>

        <Drawer
          anchor={'right'}
          open={drawerState}
          onClose={(event) => setDrawerState(false)}
        >
          <Box>
            <ChannelsList onItemClick={setVideoSrc} />
          </Box>
        </Drawer>
      </Stack>
    </>
  )
}

export default Home
