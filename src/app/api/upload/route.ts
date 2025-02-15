import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

export const runtime = 'nodejs';

// Настраиваем Cloudinary с переменными окружения
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Отладочный вывод – проверяем, что переменные подгружены корректно
console.log(
  'Cloudinary config:',
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET
);

export async function POST(request: Request) {
  try {
    // Получаем FormData из запроса
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Преобразуем полученный файл в Buffer
    const fileArrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(fileArrayBuffer);

    // Загружаем видео в Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { resource_type: 'video' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ message: 'File uploaded successfully', result });
  } catch (error) {
    console.error('Ошибка загрузки видео:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}