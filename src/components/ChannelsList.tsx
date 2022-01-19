// eslint-disable-next-line no-use-before-define
import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { List, ListItem, ListItemButton, ListItemText, Chip, ListSubheader, IconButton } from '@mui/material'
import { where } from 'firebase/firestore'
import { useFirestoreQuery } from '../hooks/Firestore'
import { Channel } from './interfaces'
import DeleteIcon from '@mui/icons-material/Delete'

export interface IChannelsListProp {
    onItemClick: (url: string) => void
}

const ChannelsList: React.FC<IChannelsListProp> = ({ onItemClick }) => {
  const [data, , setQueryFilter] = useFirestoreQuery('iptv')
  const [channelFilter, setChannelFilter] = React.useState<string>('')

  const selectedChannels = (data as Channel[]).sort((a, b) => a.tvg.name.localeCompare(b.tvg.name))
  const channelItems = selectedChannels.map((ch) => {
    const catLabels = ch.categories.map(
      (cat) => <Chip
                label={cat.name}
                key={ch.name + cat.slug}
                onClick={() => {
                  setQueryFilter(where('categories', 'array-contains', cat))
                  setChannelFilter('Category contains ' + cat.name)
                }}
            />
    )
    const langLabels = ch.languages.map(
      (lang) => <Chip
                label={lang.name}
                key={lang.name + lang.code}
                onClick={() => {
                  setQueryFilter(where('languages', 'array-contains', lang))
                  setChannelFilter('Language contains ' + lang.name)
                } }
            />
    )
    const labels = [...catLabels, ...langLabels]

    return (
            <ListItem key={uuidv4()}>
                <ListItemButton
                    onClick={() => { onItemClick(ch.url) }}
                >
                    <ListItemText
                        primary={ch.name}
                    />
                </ListItemButton>
                {labels}
            </ListItem>
    )
  })

  return (
        <List component={'div'}>
            <ListSubheader>
                <p>Channels</p>
                <ListItem secondaryAction={<IconButton onClick={() => {
                  setQueryFilter(where('url', '!=', null))
                  setChannelFilter('')
                } }><DeleteIcon /></IconButton>}>Filters: {channelFilter} </ListItem>
            </ListSubheader>
            {channelItems}
        </List>
  )
}

export default ChannelsList
