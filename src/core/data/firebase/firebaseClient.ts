// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebaseの設定情報
 */
const firebaseConfig = {
	apiKey: 'AIzaSyBKP-Mr5bF7ww1e3qfZ68Q6Y8g0VJuHDqQ',
	authDomain: 'learn-irish-82f09.firebaseapp.com',
	projectId: 'learn-irish-82f09',
	storageBucket: 'learn-irish-82f09.appspot.com',
	messagingSenderId: '701146172967',
	appId: '1:701146172967:web:fd77f824e09998603cc802',
	measurementId: 'G-RM6K6NZ0LL'
};

/**
 * Firebase初期化
 */
export const app = initializeApp(firebaseConfig);

/**
 * Firebase認証インスタンス
 */
export const auth = getAuth();

/**
 * Firestoreデータベースインスタンス
 */
export const db = getFirestore();
