// eslint-disable-next-line no-use-before-define
import React from 'react'
import { Slider, Paper, Stack, Typography, Select, InputLabel, MenuItem } from '@mui/material'

interface IBiquadFilterPanelProps {
    filterRef: React.MutableRefObject<BiquadFilterNode>
}

type AudioParams = 'frequency' | 'Q' | 'gain'

const BiquadFilterPanel: React.FC<IBiquadFilterPanelProps> = ({ filterRef }) => {
  const ctx = filterRef.current.context
  const setAudioParam = (param: AudioParams, val: number) => {
    filterRef.current[param].setValueAtTime(val, ctx.currentTime)
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
                    BiquadFilter
                </Typography>
                <InputLabel id="demo-simple-select-label">Type</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    label={'Type'}
                    // eslint-disable-next-line no-undef
                    onChange={(ev) => { filterRef.current.type = ev.target.value as BiquadFilterType }}
                >
                    {
                        ['allpass', 'bandpass', 'highpass', 'highshelf', 'lowpass', 'lowshelf', 'notch', 'peaking'].map(val => (
                            <MenuItem value={val} key={val}>{val}</MenuItem>
                        ))
                    }
                </Select>
                <Typography gutterBottom>
                    frequency
                </Typography>
                <Slider
                    defaultValue={filterRef.current.frequency.value}
                    onChange={(ev, val) => setAudioParam('frequency', val as number)}
                    valueLabelDisplay={'auto'}
                    min={0}
                    max={filterRef.current.frequency.maxValue}
                    step={0.1}
                    sx={{ width: 0.8 }}
                />
                {
                    (['Q', 'gain'] as AudioParams[]).map((param) => (
                        <>
                            <Typography gutterBottom>
                                {param}
                            </Typography>
                            <Slider
                                defaultValue={filterRef.current[param].value}
                                onChange={(ev, val) => setAudioParam(param, val as number)}
                                valueLabelDisplay={'auto'}
                                max={filterRef.current[param].maxValue}
                                min={filterRef.current[param].minValue}
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

export default BiquadFilterPanel
