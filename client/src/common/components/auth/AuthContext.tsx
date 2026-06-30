import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../utils/api';
import { useTranslation } from 'react-i18next';

/**
 * @interface AuthContextType
 * @property {boolean} isAuthenticated - Флаг успешной авторизации.
 * @property {boolean} isLoading - Флаг загрузки (процесс проверки initData и получения токена).
 * @property {string | null} error - Текст ошибки, если авторизация не удалась.
 */
interface AuthContextType
{
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const tg = window.Telegram?.WebApp;

/**
 * Провайдер авторизации.
 * Инкапсулирует логику Telegram WebApp SDK и получение JWT-токена.
 * * @param {Object} props - Свойства компонента.
 * @param {ReactNode} props.children - Дочерние компоненты (обычно роутер с маршрутами).
 */
export const AuthProvider = ({ children }: { children: ReactNode }) =>
{
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [t] = useTranslation();

	useEffect(() =>
	{
		const authenticateUser = async () =>
		{
			try
			{
				if (!tg)
				{
					throw new Error('Telegram WebApp скрипт не загружен');
				}

				tg.ready();
				tg.expand();

				const initData = tg.initData;

				if (!initData)
				{
					throw new Error('Приложение открыто вне Telegram');
				}

				const response = await fetch(
					`${API_BASE_URL}/auth/telegram-login`,
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ initData }),
					},
				);

				if (!response.ok)
				{
					throw new Error('Ошибка авторизации на сервере');
				}

				const data = await response.json();

				// Сохраняем JWT для будущих API запросов
				localStorage.setItem('accessToken', data.accessToken);
				setIsAuthenticated(true);
			}
			catch (err: any)
			{
				console.error('Auth Error:', err);
				setError(err.message || 'Неизвестная ошибка авторизации');
				tg?.showAlert(`Ошибка входа в приложение`);
			}
			finally
			{
				setIsLoading(false);
			}
		};

		authenticateUser();
	}, []);

	if (isLoading)
	{
		return (
			<div className='min-h-screen flex items-center justify-center bg-slate-900 text-white'>
				<span className='text-xl animate-pulse'>{t('auth.loading')}</span>
			</div>
		);
	}

	if (error)
	{
		return (
			<div className='min-h-screen flex flex-col items-center justify-center bg-slate-900 text-red-500 p-4 text-center'>
				<h2 className='text-2xl font-bold mb-2'>
					{t('auth.error')}
				</h2>
				<p>{error}</p>
			</div>
		);
	}

	return (
		<AuthContext.Provider value={{ isAuthenticated, isLoading, error }}>
			{children}
		</AuthContext.Provider>
	);
};

/**
 * Хук для быстрого доступа к состоянию авторизации из любого компонента.
 */
export const useAuth = (): AuthContextType =>
{
	const context = useContext(AuthContext);
	if (!context)
	{
		throw new Error('useAuth должен использоваться внутри AuthProvider');
	}
	return context;
};
