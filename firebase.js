import { initializeApp } from "firebase/app";
import {initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";




const firebaseConfig = {
    apiKey: "AIzaSyA7UmdydQOUW1Qylf04jTiJPrTkGJ6uH0g",
    authDomain: "water-bussiness-app.firebaseapp.com",
    projectId: "water-bussiness-app",
    storageBucket: "water-bussiness-app.firebasestorage.app",
    messagingSenderId: "728107875525",
    appId: "1:728107875525:web:6f578a0e9529df27d504ac",
    measurementId: "G-KFVYPS2GH5"
};


const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);

export {app, auth, db };


