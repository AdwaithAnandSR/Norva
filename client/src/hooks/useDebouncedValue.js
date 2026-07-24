import { useEffect, useState } from "react";

// Returns `value`, but updated only after `delay` ms have passed without it changing.
export const useDebouncedValue = (value, delay = 350) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
};
