export default async function handler(req, res) {
    // Разрешаем CORS-запросы (опционально, но полезно для Vercel)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не поддерживается. Используйте POST.' });
    }

    // Берём ключ из переменных окружения Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'На сервере не настроена переменная GEMINI_API_KEY' });
    }

    try {
        const { contents, systemInstruction } = req.body;

        // Отправляем запрос напрямую к Google API с нашего бэкенда
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, systemInstruction })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || 'Ошибка Gemini API' });
        }

        // Возвращаем результат клиенту
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: `Внутренняя ошибка сервера: ${error.message}` });
    }
}
