// eslint-disable-next-line no-use-before-define
import React from 'react'
import { Slider, Paper, Stack, Typography } from '@mui/material'
import VolumeUp from '@mui/icons-material/VolumeUp'

interface IStereoPannerPanelProps {
    stereoPannerRef: React.MutableRefObject<StereoPannerNode>
}

const StereoPannerPanel: React.FC<IStereoPannerPanelProps> = ({ stereoPannerRef }) => {
  const ctx = stereoPannerRef.current.context
  const setGain = (val: number) => {
    stereoPannerRef.current.pan.setValueAtTime(val, ctx.currentTime)
  }

  return (
        <Paper elevation={6}>
            <Stack
                direction={'column'}
                justifyContent={'space-around'}
                alignItems={'flex-start'}
                spacing={2}
                sx={{ padding: 3 }}
            >
                <Typography variant={'h5'}>
                    Stereo Pan
                </Typography>
                <Typography id="input-slider" gutterBottom>
                    Pan
                </Typography>
                <VolumeUp />
                <Slider
                    defaultValue={stereoPannerRef.current.pan.value}
                    onChange={(ev, val) => setGain(val as number) }
                    valueLabelDisplay={'auto'}
                    max={stereoPannerRef.current.pan.maxValue}
                    min={stereoPannerRef.current.pan.minValue}
                    step={0.1}
                    sx={{ width: 0.8 }}
                />
            </Stack>
        </Paper>
  )
}

export default StereoPannerPanel
