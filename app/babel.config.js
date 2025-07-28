module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["./"],
                    alias: {
                        "@components": "./components",
                        "@assets": "./assets",
                        "@utils": "./utils",
                        "@context": "./context",
                        "@controllers": "./controllers",
                        "@hooks": "./hooks",
                        "@store": "./store",
                    }
                }
            ]
        ]
    };
};
