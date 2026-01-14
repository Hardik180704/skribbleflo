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
