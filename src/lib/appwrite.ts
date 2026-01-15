import { Client, Account, Databases, Storage, ID } from 'appwrite';

export const client = new Client();

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID; 
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

if (!PROJECT_ID || !ENDPOINT) {
    console.error('Appwrite Project ID or Endpoint missing in environment variables');
}

client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Configuration
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '69689a4d002eb80a4419'; 
const COLLECTION_STROKES = 'strokes';
const COLLECTION_FOLDERS = 'folders';
const COLLECTION_NOTES = 'notes';

console.log("Appwrite Config:", { DATABASE_ID, COLLECTION_FOLDERS });

// --- Strokes (Extension) ---

export const saveStroke = async (strokeData: any, url: string) => {
    try {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTION_STROKES,
            ID.unique(),
            {
                url: url,
                data: JSON.stringify(strokeData),
                user_id: 'anonymous', 
                color: strokeData.stroke || '#000',
                created_at: new Date().toISOString()
            }
        );
    } catch (error) {
        console.error("Failed to save stroke:", error);
    }
};

export const subscribeToStrokes = (url: string, callback: (payload: any) => void) => {
    return client.subscribe(
        `databases.${DATABASE_ID}.collections.${COLLECTION_STROKES}.documents`,
        (response) => {
            if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                const payload = response.payload as any;
                if (payload.url === url) {
                    callback(payload);
                }
            }
        }
    );
};

// --- Features (Dashboard) ---

export const getFolders = async (userId: string) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_FOLDERS,
            // [Query.equal('user_id', userId)] // Enable when auth is strict
        );
        return response.documents;
    } catch (error) {
        console.error("Failed to fetch folders:", error);
        return [];
    }
};

export const createFolder = async (name: string, color: string, userId: string) => {
    return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_FOLDERS,
        ID.unique(),
        {
            name,
            color,
            user_id: userId,
            created_at: new Date().toISOString()
        }
    );
};

export const getNotes = async (userId: string) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_NOTES,
            // [Query.equal('user_id', userId)]
        );
        return response.documents;
    } catch (error) {
        console.error("Failed to fetch notes:", error);
        return [];
    }
};

export const createNote = async (title: string, excerpt: string, color: string, userId: string) => {
    return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_NOTES,
        ID.unique(),
        {
            title,
            excerpt,
            color,
            user_id: userId,
            created_at: new Date().toISOString()
        }
    );
};
