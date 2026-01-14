import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { client, account } from './appwrite';
import { Models } from 'appwrite';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    login: (provider: 'google' | 'github') => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
        try {
            const current = await account.get();
            setUser(current);
        } catch (error) {
            console.log('No active session', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = async (provider: 'google' | 'github') => {
        try {
            setLoading(true);
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

                // Parse the response URL to extract the 'secret' and 'userId' (Appwrite legacy) 
                // OR Appwrite sets a cookie. 
                // Appwrite OAuth2 success redirects with ?secret=xyz&userId=abc if using 'success' param properly?
                // Actually, Appwrite sets the session cookie on DOMAIN (cloud.appwrite.io).
                // BUT Chrome Extension does not share cookies with cloud.appwrite.io by default unless Host Permissions.
                // WE HAVE Host Permissions "https://cloud.appwrite.io/*".
                
                // If Appwrite sets the cookie on cloud.appwrite.io, our requests to cloud.appwrite.io 
                // from the extension (Background/Popup) SHOULD include the cookie automatically.
                
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
        <AuthContext.Provider value={{ user, loading, login, logout, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
