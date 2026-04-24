import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, IUser } from '@/types';

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    isInitialized: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: IUser; token: string }>
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
            state.isInitialized = true;
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.isInitialized = true;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        },
        updateUser: (state, action: PayloadAction<Partial<IUser>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
        initializeAuth: (state) => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                const userJson = localStorage.getItem('user');
                if (token && userJson) {
                    try {
                        state.user = JSON.parse(userJson);
                        state.token = token;
                        state.isAuthenticated = true;
                    } catch (e) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                }
            }
            state.loading = false;
            state.isInitialized = true;
        }
    },
});

export const { setCredentials, logout, updateUser, setLoading, setError, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
