import "dotenv/config";
import groq from "./groq.js";

const testGroq = async () => {
  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: "Reply with exactly: ShipSafe AI Connected!",
        },
      ],
    });

    console.log(
      "Groq Response:",
      response.choices[0].message.content
    );
  } catch (error) {
    console.error("Groq connection failed:", error.message);
  }
};

testGroq();