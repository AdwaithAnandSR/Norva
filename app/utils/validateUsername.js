export const isValidUsername = input => {
    if (typeof input !== "string") return false;

    const normalized = input.normalize("NFKC");

    const validCharRegex = /^[\p{L}._-]+$/u; // only letters, dot, underscore, dash
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

    // Reject if it contains any emojis
    if (emojiRegex.test(normalized)) return false;

    // Reject if it has any invalid characters
    if (!validCharRegex.test(normalized)) return false;

    // Minimum and maximum length check
    if (normalized.length < 8) return false;

    return true;
};

export const isValidPassword = (input)=>{
    if (typeof input !== "string") return false;

    const normalized = input.normalize("NFKC");
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

    // emojis
    if (emojiRegex.test(normalized)) return false;
    
    // white space
    if (/\s/.test(normalized)) return false;
    
    if (normalized.length < 8) return false;

    return true;
    
}