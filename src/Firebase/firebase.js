import { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
    setDoc
} from 'firebase/firestore';
import config_env from './../config';

const config = {
    apiKey: config_env.apiKey,
    authDomain: config_env.authDomain,
    databaseURL: config_env.databaseURL,
    projectId: config_env.projectId,
    storageBucket: config_env.storageBucket,
    messagingSenderId: config_env.messagingSenderId,
    appId: config_env.appId,
    measurementId: config_env.measurementId
};
const app = initializeApp(config);
const auth = getAuth(app);
const firestore = getFirestore(app);

export const createUserProfileDocument = async (userAuth, additionalData) => {
    if (!userAuth) return;
    const userRef = doc(firestore, `users/${userAuth.uid}`);
    const snapShot = await getDoc(userRef);

    if (!snapShot.exists()) {
        const { username, email } = userAuth;
        const createdAt = new Date();

        try {
            await setDoc(userRef, {
                username,
                email,
                createdAt,
                ...additionalData
            });
        } catch (error) {
            console.log('error creating user', error.message);
        }
    }
    return userRef;
};

export const useFirestore = (collectionName, docName) => {
    const [data, setData] = useState(null);
    const docRef = useMemo(
        () => doc(firestore, collectionName, docName),
        [collectionName, docName]
    );
    useEffect(() => {
        // const docRef = firebase.firestore().collection(collection).doc(docName);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            setData(doc.exists() ? doc.data() : null);
        });

        return () => unsubscribe();
    }, [docRef]);

    const updateData = useCallback(
        (newData) => {
            updateDoc(docRef, newData).catch((error) =>
                console.error('Update failed:', error)
            );
        },
        [docRef]
    );

    return [data, updateData];
};

export const useFireStoreCollection = (collectionName) => {
    const [data, setData] = useState([]);
    const collectionRef = useMemo(
        () => collection(firestore, collectionName),
        [collectionName]
    );
    useEffect(() => {
        const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
            setData(snapshot.docs.map((d) => ({ ...d.data(), id: d.id })));
        });
        return unsubscribe;
    }, [collectionRef]);

    const updateDocument = useCallback(
        (docId, newData) => {
            const docRef = doc(firestore, collectionName, docId);
            updateDoc(docRef, newData).catch((error) =>
                console.error('Update failed:', error)
            );
        },
        [collectionName]
    );

    return [data, updateDocument];
};

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
    prompt: 'select_account'
});

export const signInWithGoogle = () => signInWithPopup(provider);
export { auth, firestore };
