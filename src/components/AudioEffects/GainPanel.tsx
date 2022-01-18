// eslint-disable-next-line no-use-before-define
import React from 'react'
import { Slider, Paper, Stack, Typography } from '@mui/material'
import VolumeUp from '@mui/icons-material/VolumeUp'

interface IGainPanelProps {
    gainRef: React.MutableRefObject<GainNode>
}

const GainPanel: React.FC<IGainPanelProps> = ({ gainRef }) => {
  const ctx = gainRef.current.context
  const setGain = (val: number) => {
    gainRef.current.gain.setValueAtTime(val, ctx.currentTime)
  }

  return (
        <Paper elevation={6} sx={{ minWidth: 400, minHeight: 300 }} >
            <Stack
                direction={'column'}
                justifyContent={'space-around'}
                alignItems={'flex-start'}
                spacing={2}
            >
                <Typography variant={'h3'}>
                    Gain
                </Typography>
                <Typography id="input-slider" gutterBottom>
                    Volume
                </Typography>
                <VolumeUp />
                <Slider
                    defaultValue={gainRef.current.gain.value}
                    onChange={(ev, val) => setGain(val as number) }
                    valueLabelDisplay={'auto'}
                    max={10}
                    min={0.1}
                    step={0.01}
                    sx={{ width: 0.8 }}
                />
            </Stack>
        </Paper>
  )
}

export default GainPanel
