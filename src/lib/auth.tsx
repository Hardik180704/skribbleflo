import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { client, account } from './appwrite';
import { Models } from 'appwrite';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    error: string | null;
    login: (provider: 'google' | 'github') => Promise<void>;
    loginAnonymous: () => Promise<void>;

    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkSession = async () => {
        try {
            const current = await account.get();
            setUser(current);
        } catch (error) {
            console.log('No active session');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const loginAnonymous = async () => {
        try {
            setLoading(true);
            setError(null);
            await account.createAnonymousSession();
            await checkSession();
        } catch (e: any) {
            console.error("Anonymous login failed", e);
            setError(e.message || "Login failed");
            setLoading(false);
        }
    };

    const login = async (provider: 'google' | 'github') => {
        try {
            setLoading(true);
            setError(null);
            const redirectUrl = chrome.identity.getRedirectURL(); // https://<ext-id>.chromiumapp.org/
            
            // Construct Appwrite Google OAuth2 URL
            const oAuthUrl = new URL(`${client.config.endpoint}/account/sessions/oauth2/${provider}`);
            oAuthUrl.searchParams.append('project', client.config.project!);
            oAuthUrl.searchParams.append('success', redirectUrl);
            oAuthUrl.searchParams.append('failure', redirectUrl);
            oAuthUrl.searchParams.append('scopes', ['email', 'profile'].join(' '));

            // Launch Web Auth Flow
            chrome.identity.launchWebAuthFlow({
                url: oAuthUrl.toString(),
                interactive: true
            }, async (responseUrl) => {
                if (chrome.runtime.lastError || !responseUrl) {
                    console.error("Auth failed", chrome.runtime.lastError);
                    setLoading(false);
                    return;
                }
                
                // Let's verify session immediately.
                await checkSession();
            });

        } catch (e) {
            console.error("Login exception", e);
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, loginAnonymous, logout, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
