// eslint-disable-next-line no-use-before-define
import React from 'react'
import { Slider, Paper, Stack, Typography } from '@mui/material'
import VolumeUp from '@mui/icons-material/VolumeUp'

interface IDynamicCompressorPanelProps {
    compressorRef: React.MutableRefObject<DynamicsCompressorNode>
}

type AudioParams = 'threshold' | 'knee' | 'ratio' | 'attack' | 'release'

const DynamicCompressorPanel: React.FC<IDynamicCompressorPanelProps> = ({ compressorRef }) => {
  const ctx = compressorRef.current.context
  const setAudioParam = (param: AudioParams, val: number) => {
    compressorRef.current[param].setValueAtTime(val, ctx.currentTime)
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
                    Dynamics Compressor
                </Typography>
                <VolumeUp />
                {
                    (['threshold', 'attack', 'knee', 'ratio', 'release'] as AudioParams[]).map((param) => (
                        <>
                            <Typography gutterBottom>
                                {param}
                            </Typography>
                            <Slider
                                defaultValue={compressorRef.current[param].value}
                                onChange={(ev, val) => setAudioParam(param, val as number)}
                                valueLabelDisplay={'auto'}
                                max={compressorRef.current[param].maxValue}
                                min={compressorRef.current[param].minValue}
                                step={0.1}
                                sx={{ width: 0.8 }}
                            />
                        </>
                    ))
                }

            </Stack>
        </Paper>
  )
}

export default DynamicCompressorPanel
