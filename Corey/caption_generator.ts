///////////////////////////////////////////
// Input: Path to image (png, jpg, webp) //
// Output: Catchy, hook-style caption    //
///////////////////////////////////////////


import fs from "fs";
import OpenAI from "openai";

export default async function generateCaption(imagepath: string): Promise<string> {
    const openai = new OpenAI({
        apiKey: ""
    });

    let image;
    try {
        image = fs.readFileSync(imagepath, "base64");
    } catch (error) {
        return "Invalid image path";
    }
    

    const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
            {
                role: "user",
                content: [
                    { type: "input_text", text: "Generate a short, catchy, hook-style caption for this iamge" },
                    {
                        type: "input_image",
                        image_url: `data:image/jpeg;base64,${image}`,
                        detail: 'auto' // auto | high | low 
                    },
                ],
            },
        ],
    });
    return response.output_text;
}