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
    gainRef.current.gain.setValueAtTime(parseFloat((10 ** val).toFixed(2)), ctx.currentTime)
  }

  return (
        <Paper elevation={6} sx={{ width: '100%' }}>
            <Stack
                direction={'column'}
                justifyContent={'space-around'}
                alignItems={'flex-start'}
                spacing={2}
                sx={{ padding: 3 }}
            >
                <Typography variant={'h5'}>
                    Gain
                </Typography>
                <Typography id="input-slider" gutterBottom>
                    Gain
                </Typography>
                <VolumeUp />
                <Slider
                    defaultValue={gainRef.current.gain.value}
                    onChange={(ev, val) => setGain(val as number) }
                    valueLabelDisplay={'auto'}
                    max={2}
                    min={-1}
                    step={0.1}
                    sx={{ width: 0.8 }}
                    scale={(val) => parseFloat((10 ** val).toFixed(2))}
                />
            </Stack>
        </Paper>
  )
}

export default GainPanel
