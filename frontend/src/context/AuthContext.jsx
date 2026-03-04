import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
                    const res = await api.get('/auth/me');
                    setUser({ ...res.data, token: parsedUser.token });
                }
            } catch (error) {
                console.error(error);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        return res.data;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        // Only store and set user if response contains a token (non-department registration)
        if (res.data && res.data.token) {
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
        }
        return res.data;
    };

    // Reusable profile update: calls PUT, updates localStorage + state, returns updated user
    const updateUser = async (profileData) => {
        const res = await api.put('/users/profile', profileData);
        // Backend returns { success: true, user: { ... } }
        const userData = res.data?.user || res.data;
        if (userData && userData._id) {
            // Preserve the existing token (backend returns a fresh one, but keep either)
            const updatedUser = {
                ...userData,
                token: userData.token || user?.token,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return updatedUser;
        }
        throw new Error('No data returned from profile update');
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, updateUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
