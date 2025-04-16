//////////////////////////////////////////////////////////////////////
// Input: Image path, text to display, font/size/color, output path //
// Output: File with text added to image                            //
//////////////////////////////////////////////////////////////////////


import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

export default async function attachCaption(imagePath: string, text: string, font: string, fontSize: number, fontColor: string, outputFile: string) {
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext("2d");

    context.drawImage(image, 0, 0);

    try {
        context.font = `${fontSize}px ${font}`;
    } catch (error) {
        console.log("Font is invalid");
        return;
    }

    try {
        context.fillStyle = fontColor;
    } catch (error) {
        console.log("Font color is invalid");
        return;
    }
    
    wrapText(context, text, fontSize, image.width-fontSize*.5);

    try {
        fs.writeFileSync(outputFile, canvas.toBuffer('image/png'));
    } catch (error) {
        console.log("Output file path is invalid");
        return;
    }
}

function wrapText(context: any, text: string, fontSize: number, maxWidth: number) {
    const words = text.split(" ");
    const x = fontSize*.5;
    let y = fontSize;

    let line = "";
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
    
        if (testWidth > maxWidth && i > 0) {
          context.fillText(line, x, y);
          line = words[i] + " ";
          y += fontSize*1.1;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, y);
}