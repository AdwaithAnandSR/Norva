import { useEffect, useRef } from "react";
import { View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";

import Loader from "../common/Loader.tsx";

const ReelPlayer = ({
    uri,
    isActive = false,
    paused = false,
    muted = false,
    style,
    contentFit = "cover"
}) => {
    const player = useVideoPlayer(uri, p => {
        p.loop = true;
        p.muted = muted;
    });
    
    const { status, error } = useEvent(player, "statusChange", {
        status: player.status
    });

    const wasActive = useRef(false);

    useEffect(() => {
        if (!player) return;

        if (isActive && !paused) {
            player.play();
        } else {
            player.pause();

            if (!isActive && wasActive.current) {
                player.currentTime = 0;
            }
        }

        wasActive.current = isActive;
    }, [isActive, paused, player]);

    useEffect(() => {
        if (player) player.muted = muted;
    }, [muted, player]);

    return (
        <View style={style}>
            <VideoView
                player={player}
                style={{ width: "100%", height: "100%" }}
                contentFit={contentFit}
                nativeControls={false}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
            />
            {status === "loading" && (
                <View className="absolute top-0 left-0 w-screen h-screen justify-center items-center">
                    <Loader size={65} />
                </View>
            )}
        </View>
    );
};

export default ReelPlayer;
