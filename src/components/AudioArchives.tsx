// eslint-disable-next-line no-use-before-define
import React from 'react'
import { TableRow, TableCell, TableHead, Table, TableBody } from '@mui/material'

interface IAudioArchivesProps {
    audioUrls: string[]
    onPlayCb?: (id: string) => void
    onPauseCb?: (id: string) => void
}

const AudioArchives: React.FC<IAudioArchivesProps> = ({ audioUrls, onPlayCb, onPauseCb }) => {
  return (
        <Table>
        <TableHead>
          <TableRow>
            <TableCell align='left'>Audio</TableCell>
            <TableCell align='left'>Download</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {audioUrls.map((url, i) => (
            <TableRow key={`audio-${i}`}>
              <TableCell>
                <audio
                  controls
                  src={url}
                  id={`audio-${i}`}
                  onPlay={ () => {
                    if (onPlayCb) { onPlayCb(`audio-${i}`) }
                  } }
                  onPause={() => { if (onPauseCb) { onPauseCb(`audio-${i}`) } } }
                />
              </TableCell>
              <TableCell><a href={url} download={`${i}.ogg`}>Download</a></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
  )
}

export default AudioArchives
