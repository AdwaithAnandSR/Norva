import { useState, useContext, createContext } from "react";
import { Appearance } from "react-native";

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
    const [theme, setTheme] = useState(Appearance.getColorScheme());

    Appearance.addChangeListener(({ colorScheme }) => {
        setTheme(colorScheme)
    });
    

    return (
        <AppStateContext.Provider value={{ theme }}>
            {children}
        </AppStateContext.Provider>
    );
};

export const useAppState = () => useContext(AppStateContext);
