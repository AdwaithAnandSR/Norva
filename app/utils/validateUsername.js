export const isValidUsername = (input, setMessage) => {
    if (typeof input !== "string") return false;

    if (input === "") {
        setMessage(prev => ({ ...prev, username: "" }));
        return false;
    }

    const normalized = input.normalize("NFKC");

    const validCharRegex = /^[\p{L}._-]+$/u; // only letters, dot, underscore, dash
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
    const letterRegex = /\p{L}/gu;

    // Reject if it contains emojis
    if (emojiRegex.test(normalized)) {
        setMessage(prev => ({
            ...prev,
            username: "Usernames cannot contain emojis."
        }));
        return false;
    }

    // Reject if it has invalid characters
    if (!validCharRegex.test(normalized)) {
        setMessage(prev => ({
            ...prev,
            username:
                "Usernames may only include letters, dots (.), underscores (_), and dashes (-)."
        }));
        return false;
    }

    // Minimum length check
    if (normalized.length < 5) {
        setMessage(prev => ({
            ...prev,
            username: `Usernames must be at least 5 characters long. (${normalized.length}/5)`
        }));
        return false;
    }

    // Minimum letter count check
    const letters = normalized.match(letterRegex) || [];
    if (letters.length < 5) {
        setMessage(prev => ({
            ...prev,
            username: "Usernames must contain at least 5 letters."
        }));
        return false;
    }
    setMessage(prev => ({ ...prev, username: "" }));

    return true;
};

export const isValidPassword = (input, setMessage) => {
    if (typeof input !== "string") {
        setMessage(prev => ({
            ...prev,
            password: "Password must be a valid string."
        }));
        return false;
    }

    if (input === "") {
        setMessage(prev => ({ ...prev, password: "" }));
        return false;
    }

    const normalized = input.normalize("NFKC");
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

    // Emojis
    if (emojiRegex.test(normalized)) {
        setMessage(prev => ({
            ...prev,
            password: "Passwords cannot contain emojis."
        }));
        return false;
    }

    // Whitespace
    if (/\s/.test(normalized)) {
        setMessage(prev => ({
            ...prev,
            password: "Passwords cannot contain spaces."
        }));
        return false;
    }

    // Minimum length
    if (normalized.length < 8) {
        setMessage(prev => ({
            ...prev,
            password: `Passwords must be at least 8 characters long. (${normalized.length}/8)`
        }));
        return false;
    }

    // Must include at least one lowercase letter
    if (!/[a-z]/.test(normalized)) {
        setMessage(prev => ({
            ...prev,
            password: "Passwords must include at least one lowercase letter."
        }));
        return false;
    }

    // Must include at least one uppercase letter
    if (!/[A-Z]/.test(normalized)) {
        setMessage(prev => ({
            ...prev,
            password: "Passwords must include at least one uppercase letter."
        }));
        return false;
    }

    // Must include at least one digit
    if (!/\d/.test(normalized)) {
        setMessage(prev => ({
            ...prev,
            password: "Passwords must include at least one number."
        }));
        return false;
    }

    // Must include at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]=+\/]/.test(normalized)) {
        setMessage(prev => ({
            ...prev,
            password: "Passwords must include at least one special character."
        }));
        return false;
    }

    setMessage(prev => ({ ...prev, password: "" }));
    return true;
};
