import * as admin from 'firebase-admin';

export function initializeFirebase() {
    try {
        admin.initializeApp({
            storageBucket: 'bookworm-85601.appspot.com'
        });
        console.log('Firebase Initialized');
    } catch (error) {
        console.error('Firebase initialization error: did you set the GOOGLE_APPLICATION_CREDENTIALS environment variable? Remember to run ./env.sh');
        throw error;
    }
}

initializeFirebase();

export const db = admin.firestore();