// TODO
// API key
// Advanced text placement (left, center, right, top, bottom)

import generateCaption from "./caption_generator";
import attachCaption from "./caption_attacher";

async function main() {
    const imagePath = prompt("Image path: ");
    if (!imagePath) {
        console.log("Image path can not be null.");
        return;
    }

    const font = prompt("Font: ");
    if (!font) {
        console.log("Font can not be null.");
        return;
    }

    const fontSize = prompt("Font: ");
    if (!fontSize) {
        console.log("Font can not be null.");
        return;
    }
    if (isNaN(Number(fontSize))) {
        console.log("Font size must be a number");
        return;
    }

    const color = prompt("Text color: ");
    if (!color) {
        console.log("Color can not be null");
        return;
    }

    const outputPath = prompt("Output path: ");
    if (!outputPath) {
        console.log("Output path can not be null");
        return;
    }

    const caption = await generateCaption(imagePath);
    attachCaption(imagePath, caption, font, Number(fontSize), color, outputPath);
    console.log("Caption generation and attachment is complete.");
}

// main();

// Image path, Text, Font, Font size, Font color, output path
const image = "./images/sunset.png";
attachCaption(image, "Hello, World! This is a wrapping test.", "Arial", 80, "white", "./captioned_images/output.png");