// eslint-disable-next-line no-use-before-define
import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { List, ListItemButton, ListItemText, Chip, ListSubheader } from '@mui/material'
import { where } from 'firebase/firestore'
import { useFirestoreQuery } from '../hooks/Firestore'
import { Channel } from './interfaces'
import { countries } from './constants'

export interface IChannelsListProp {
    onItemClick: (url: string) => void
}

const ChannelsList: React.FC<IChannelsListProp> = ({ onItemClick }) => {
  const [data, setFilter] = useFirestoreQuery('iptv')

  const selectedChannels = (data as Channel[]).sort((a, b) => a.tvg.name.localeCompare(b.tvg.name))
  const channelItems = selectedChannels.map((ch) => {
    const labels = ch.categories.map((cat) => <Chip label={cat.name} key={ch.name + cat.slug}/>)

    return (
            <ListItemButton
                key={uuidv4()}
                onClick={() => { onItemClick(ch.url); setFilter(where('countries', 'array-contains', countries.UA)) }}
            >
                <ListItemText
                    primary={ch.name}
                    secondary={labels}
                />
            </ListItemButton>
    )
  })

  return (
        <List>
            <ListSubheader>Channels</ListSubheader>
            {channelItems}
        </List>
  )
}

export default ChannelsList
