import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './common/components/auth/AuthContext';
import HomePage from './pages/HomePage';

/**
 * Корневой компонент приложения.
 * Инициализирует провайдер авторизации и систему маршрутизации.
 * * @returns {JSX.Element} Иерархия провайдеров и маршрутов.
 */
function App()
{
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<HomePage />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
