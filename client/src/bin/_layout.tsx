import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useResolveClassNames } from "uniwind";
import { useSegments } from "expo-router";

export default function TabsLayout() {
    const {
        backgroundColor,
        color: iconColor,
        borderColor: indicatorColor
    } = useResolveClassNames(
        "bg-primary text-text-secondary border-card-selected"
    );

    const currentRoute = useSegments().at(-1);
    const hidden = currentRoute === "Feeds";
    
    console.log(currentRoute, hidden)

    return (
        <NativeTabs
            hidden={hidden}
            backgroundColor={backgroundColor}
            iconColor={iconColor}
            indicatorColor={indicatorColor}
        >
            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Icon
                    sf={{ default: "house", selected: "house.fill" }}
                    md="home"
                />
                <NativeTabs.Trigger.Label hidden />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="Search">
                <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
                <NativeTabs.Trigger.Label hidden />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="Feeds">
                <NativeTabs.Trigger.Icon sf="film" md="movie" />
                <NativeTabs.Trigger.Label hidden />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="Profile">
                <NativeTabs.Trigger.Icon sf="person" md="person" />
                <NativeTabs.Trigger.Label hidden />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
