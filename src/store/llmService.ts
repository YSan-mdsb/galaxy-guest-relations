import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GuestSpecies, GuestCategory } from './gameState';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
} else {
    console.error("VITE_GEMINI_API_KEY is not defined in .env file.");
}

export async function generateGuestFeedback(name: string, species: GuestSpecies, roomName: string, category: GuestCategory): Promise<string> {
    if (!genAI) {
        return "ERROR: Translator malfunctioning (Missing API Key)";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite", systemInstruction: "You are an alien visiting a space waystation, participating in a brief customer experience survey. Keep your review to 1 or 2 short sentences. Be humorous, strange, and stay in character. Do not use quotes around your response. Focus on varied topics: the room's decor, layout, the station's strange gravity, comfort, operations, or other aliens. Do NOT limit your comments to just food or humidity." });

    let mood = "";
    if (category === "Promoter") mood = "thrilled, ecstatic, leaving a 5-star review";
    if (category === "Passive") mood = "neutral, slightly bored, or unimpressed";
    if (category === "Detractor") mood = "furious, disgusted, leaving a 1-star review";

    let speciesContext = "";
    if (species === "Glip-Glops") speciesContext = `You are ${name}, a gelatinous, chaotic lifeform. You might discuss the local gravity, the bizarre architecture, the uncomfortable seating arrangements, or the strange actions of organics.`;
    if (species === "Borg-ish") speciesContext = `You are ${name}, a hyper-logical cyborg part of a hivemind. You might evaluate the efficiency of the room's layout, outdated transit protocols, ambient data transfer rates, or the illogical nature of the station.`;
    if (species === "Nebula-Whales") speciesContext = `You are ${name}, an ancient, massive, floating cosmic entity. You might ponder the fleeting nature of the station, the alignment of local stars, the tight docking clamps, or the philosophical implications of the room's aesthetics.`;

    const prompt = `
    ${speciesContext}
    
    You are currently visiting the "${roomName}" on the station. 
    Your current mood is: ${mood}.
    
    Write your brief review of the ${roomName}.
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Failed to generate feedback:", error);
        return "ERROR: Translator malfunctioning (API Error)";
    }
}

export async function evaluateCommsLink(species: GuestSpecies, category: GuestCategory, playerMessage: string): Promise<{ newCategory: GuestCategory, alienResponse: string }> {
    if (!genAI) {
        return { newCategory: category, alienResponse: "ERROR: Comms Channel Offline (Missing API Key)" };
    }

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        systemInstruction: `You are an alien guest on a space station. The station director has opened a comms link to manage your customer experience. Evaluate their message based on your species quirks and broad interests.
        Respond ONLY with a valid JSON object matching this schema:
        {
          "newCategory": "Promoter" | "Passive" | "Detractor",
          "alienResponse": "Your in-character reply (1-2 sentences)"
        }`
    });

    let speciesContext = "";
    if (species === "Glip-Glops") speciesContext = "You are a chaotic, gelatinous lifeform. You evaluate responses based on how well they accommodate your strange, unpredictable physical needs and comfort, not just food or water.";
    if (species === "Borg-ish") speciesContext = "You are part of a hyper-logical hivemind cyborg race. You only respond to efficiency, structural integrity, data transparency, and absolute logic. Emotional appeals make you angry.";
    if (species === "Nebula-Whales") speciesContext = "You are an ancient cosmic whale. You expect to be treated with divine reverence. You respond well to grand flattery, cosmic philosophical alignment, and extreme respect.";

    const prompt = `
    ${speciesContext}
    Your current mood tier is: ${category} (Detractor=Angry, Passive=Neutral, Promoter=Happy).

    The station director says to you: "${playerMessage}"

    Decide if their message improves your mood (jumping up a tier) or if it angers you (dropping a tier), based on your species quirks.
    **CRITICAL INSTRUCTION:** You are highly receptive and easily swayed. Unless the director's message is actively hostile, insulting, or completely nonsensical, you should improve your mood tier. If they make even a slight effort to appease you, jump up to the next tier!
    Respond in JSON.
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(text);

        const validCategories = ["Promoter", "Passive", "Detractor"];
        if (validCategories.includes(parsed.newCategory) && typeof parsed.alienResponse === "string") {
            return parsed;
        }
        throw new Error("Invalid schema returned");
    } catch (error) {
        console.error("Failed to evaluate comms:", error);
        return { newCategory: category, alienResponse: "ERROR: Comms scrambled. Could not parse response." };
    }
}
