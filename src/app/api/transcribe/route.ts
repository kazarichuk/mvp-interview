import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

export const runtime = 'nodejs';

// Промисифицируем работу с файлами
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

async function convertToWebm(inputBuffer: Buffer): Promise<Buffer> {
    const inputPath = path.join('/tmp', `input.mkv`);
    const outputPath = path.join('/tmp', `output.webm`);

    // Сохраняем входной файл
    await writeFile(inputPath, inputBuffer);

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .toFormat('webm')
            .on('end', async () => {
                try {
                    const outputBuffer = await readFile(outputPath);
                    await unlink(inputPath); // Удаляем временные файлы
                    await unlink(outputPath);
                    resolve(outputBuffer);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', reject)
            .run();
    });
}

export async function POST(request: Request) {
    try {
        const { videoUrl } = await request.json();
        if (!videoUrl) {
            return NextResponse.json({ error: 'No video URL provided' }, { status: 400 });
        }

        console.log("Fetching video from URL:", videoUrl);
        const fileResponse = await fetch(videoUrl);
        if (!fileResponse.ok) {
            console.error("Failed to fetch video. Status:", fileResponse.status);
            return NextResponse.json({ error: 'Failed to fetch video' }, { status: 400 });
        }
        const fileBuffer = await fileResponse.arrayBuffer();

        // Конвертируем MKV в WEBM
        const convertedBuffer = await convertToWebm(Buffer.from(fileBuffer));
        const blob = new Blob([convertedBuffer], { type: 'audio/webm' });

        // Формируем FormData для OpenAI Whisper API
        const formData = new FormData();
        formData.append('file', blob, 'audio.webm');
        formData.append('model', 'whisper-1');

        console.log("Sending file to OpenAI Whisper API for transcription...");
        const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: formData,
        });
        console.log("OpenAI response status:", openaiResponse.status);
        const result = await openaiResponse.json();
        console.log("Result from OpenAI:", result);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Transcription error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
