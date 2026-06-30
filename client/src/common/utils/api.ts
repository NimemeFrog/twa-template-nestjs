export const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Обертка над нативным fetch для автоматической инъекции токена авторизации.
 * Обеспечивает безопасность и централизованную обработку запросов.
 * * @param {string} endpoint - Конечная точка API (например, '/protected-route').
 * @param {RequestInit} [options={}] - Стандартные опции fetch (method, headers, body и т.д.).
 * @returns {Promise<Response>} Ответ сервера.
 * @throws {Error} Пробрасывает ошибку, если запрос завершился неудачно.
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> =>
{
	const token = localStorage.getItem('accessToken');

	const headers = new Headers(options.headers || {});
	headers.set('Content-Type', 'application/json');

	if (token)
	{
		headers.set('Authorization', `Bearer ${token}`);
	}

	const config: RequestInit = {
		...options,
		headers,
	};

	const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

	if (response.status === 401)
	{
		console.warn('Токен истек или недействителен. Требуется повторная авторизация.');
		localStorage.removeItem('accessToken');
		window.location.reload();
	}

	return response;
};
