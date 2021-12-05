import React, { useState } from "react";
import videojs from "video.js";
import VideoPlayer from '../components/VideoPlayer';
import ChannelsList from "../components/ChannelsList";
import { Box, Button, Drawer, Container, Stack } from "@mui/material";

const Home: React.FC<{}> = () => {
    const [drawerState, setDrawerState] = useState(false);
    const [vidOptions, setVidOptions] = React.useState<videojs.PlayerOptions>({
        sources: [
            // {
            //     src: "https://cdn.hkdtmb.com/hls/99/index.m3u8",
            //     type: 'application/x-mpegURL'
            // }
        ]
    });

    React.useEffect(() => {
        console.log(vidOptions)
    }, [vidOptions]);

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
        );
    };

    return (
        <>
            <Stack
                justifyContent={'space-around'}
                alignItems={'center'}
                spacing={2}
            >
                <Container sx={{ width: 0.5, margin: 5 }}>
                    <VideoPlayer options={vidOptions} />
                </Container>
                <Button
                    onClick={(event) => setDrawerState(true)}
                >Open</Button>

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

export default Home;