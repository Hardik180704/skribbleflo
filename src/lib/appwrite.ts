import { Client, Account, Databases, Storage } from 'appwrite';

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

// Configuration - typically these would be in .env but for the extension we might need to fetch them or hardcode if simple
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'scribble-db'; 
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID || 'strokes';

export const saveStroke = async (strokeData: any, url: string) => {
    try {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            'unique()', // ID.unique()
            {
                url: url,
                data: JSON.stringify(strokeData),
                user_id: 'anonymous', // pending auth
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
        `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`,
        (response) => {
            if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                const payload = response.payload as any;
                // Filter by URL 
                if (payload.url === url) {
                    callback(payload);
                }
            }
        }
    );
};
