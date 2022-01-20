// eslint-disable-next-line no-use-before-define
import * as React from 'react'
import { Modal, Grid, Button, Box, Card, Fab } from '@mui/material'
import { Piano } from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { Sampler } from 'tone'

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  height: '50%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const Item = styled(Card)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary
}))

interface ISamplerModalProps {
    audioUrls: string[]
    samplerRef: React.MutableRefObject<Sampler>
    isSamplerLoaded: boolean
}

const SamplerModal: React.FC<ISamplerModalProps> = ({ audioUrls, samplerRef, isSamplerLoaded }) => {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const onClick = (i: number) => {
    console.log(i)
    samplerRef.current.triggerAttack(`A${i}`)
  }

  const onKeyPressed = React.useCallback((event: KeyboardEvent) => {
    const e = event || window.event
    const key = e.key
    try {
      const num = parseInt(key)
      if (num <= Math.min(8, audioUrls.length)) {
        onClick(num)
      }
    } catch {
      console.error(e)
    }
  }, [])

  React.useEffect(() => {
    document.addEventListener('keydown', onKeyPressed, false)

    return () => {
      document.removeEventListener('keydown', onKeyPressed, false)
    }
  }, [])

  return (
        <div>
            <Fab onClick={handleOpen} color={'primary'} sx={{ position: 'absolute', bottom: 16, right: 16 }}><Piano /></Fab>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Grid container sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {
                            [...new Array(9)].map((_, i) => (
                                <Grid item xs={4} key={i} sx={{ height: '100%' }}>
                                    <Item>
                                        <Button disabled={audioUrls.length <= i || !isSamplerLoaded} sx={{ width: '100%' }} onClick={() => onClick(i)}>{i}</Button>
                                    </Item>
                                </Grid>
                            ))
                        }
                    </Grid>
                </Box>
            </Modal>
        </div>
  )
}

export default SamplerModal
