/**
 * Firebase Firestore Cloud Persistence Layer for Step into the Future
 * Real-time synchronization across desktop, laptop, tablet, and mobile.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export const firebaseConfig = {
  apiKey: "AIzaSyBELaJb8T-cPWNBwdoWzMz7B-NRoULTuqA",
  authDomain: "stepintothefuture.firebaseapp.com",
  projectId: "stepintothefuture",
  storageBucket: "stepintothefuture.firebasestorage.app",
  messagingSenderId: "1033683818329",
  appId: "1:1033683818329:web:7f2256892487198b3c9e48",
  measurementId: "G-TM5RYQZSR8"
};

let app = null;
let db = null;
let isConfigured = false;
let cloudSyncStatus = 'connecting'; // 'connecting' | 'connected' | 'saving' | 'error' | 'offline'
const statusListeners = [];

export function onCloudStatusChange(listener) {
  statusListeners.push(listener);
  try {
    listener(cloudSyncStatus);
  } catch (e) {}
  return () => {
    const idx = statusListeners.indexOf(listener);
    if (idx !== -1) statusListeners.splice(idx, 1);
  };
}

export function getCloudStatus() {
  return cloudSyncStatus;
}

function updateStatus(newStatus) {
  cloudSyncStatus = newStatus;
  statusListeners.forEach(fn => {
    try { fn(newStatus); } catch (e) {}
  });
}

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  isConfigured = true;
  console.info('🔥 Firebase Cloud client initialized for project: stepintothefuture');
} catch (err) {
  console.warn('⚠️ Firebase initialization failed:', err);
  updateStatus('offline');
}

export { app, db, isConfigured };

function sanitize(obj) {
  if (obj === undefined) return null;
  return JSON.parse(JSON.stringify(obj, (k, v) => (v === undefined ? null : v)));
}

let saveTimeout = null;
let pendingState = null;
let pendingOptions = { appData: true, lessons: false };

/**
 * Debounced save to Firestore cloud database
 */
export function saveCloudState(state, options = { appData: true, lessons: false }) {
  if (!db || !isConfigured || !state) return;

  pendingState = state;
  if (options.appData) pendingOptions.appData = true;
  if (options.lessons) pendingOptions.lessons = true;

  if (saveTimeout) clearTimeout(saveTimeout);
  updateStatus('saving');

  saveTimeout = setTimeout(async () => {
    const toSave = pendingState;
    const opts = { ...pendingOptions };
    pendingState = null;
    pendingOptions = { appData: false, lessons: false };
    saveTimeout = null;

    if (!toSave) return;

    try {
      const promises = [];

      if (opts.appData) {
        const appPayload = sanitize({
          admin: toSave.admin,
          teachers: toSave.teachers,
          groups: toSave.groups,
          students: toSave.students,
          deletedStudents: toSave.deletedStudents || [],
          schedule: toSave.schedule || [],
          payments: toSave.payments || {},
          pointRecords: toSave.pointRecords || [],
          shopItems: toSave.shopItems || [],
          purchases: toSave.purchases || [],
          deletedTextbooks: toSave.deletedTextbooks || [],
          textbooks: toSave.textbooks || [],
          lastUpdated: new Date().toISOString()
        });
        promises.push(setDoc(doc(db, 'crm', 'app_data'), appPayload, { merge: true }));
      }

      if (opts.lessons) {
        const lessonsPayload = sanitize({
          textbookLessons: toSave.textbookLessons || {},
          textbookVocabularyPool: toSave.textbookVocabularyPool || {},
          lastUpdated: new Date().toISOString()
        });
        promises.push(setDoc(doc(db, 'crm', 'lessons_data'), lessonsPayload, { merge: true }));
      }

      await Promise.all(promises);
      updateStatus('connected');
      console.info('☁️ Cloud Firestore database updated successfully');
    } catch (err) {
      console.warn('⚠️ Cloud Firestore save warning:', err.message || err);
      updateStatus('error');
    }
  }, 300);
}

/**
 * Initialize real-time cloud listeners with onSnapshot
 */
export function initCloudSync(store) {
  if (!db || !isConfigured) return;

  let initialAppDataReceived = false;

  // 1. Listen to app_data (students, groups, teachers, points, schedule)
  try {
    const appDocRef = doc(db, 'crm', 'app_data');
    onSnapshot(appDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudAppData = docSnap.data();
        updateStatus('connected');
        initialAppDataReceived = true;
        store.applyCloudAppData(cloudAppData);
      } else {
        // Document does not exist in Firestore yet: seed from current store state!
        console.info('☁️ Initializing new Firestore database with current local state...');
        updateStatus('connected');
        initialAppDataReceived = true;
        saveCloudState(store.state, { appData: true, lessons: true });
      }
    }, (err) => {
      console.warn('⚠️ Cloud app_data listener warning (check Firestore Database is created in Test Mode):', err.message || err);
      updateStatus('error');
    });
  } catch (err) {
    console.warn('⚠️ Firestore app_data subscribe error:', err);
    updateStatus('error');
  }

  // 2. Listen to lessons_data (textbook lessons & vocabulary pool)
  try {
    const lessonsDocRef = doc(db, 'crm', 'lessons_data');
    onSnapshot(lessonsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudLessonsData = docSnap.data();
        store.applyCloudLessonsData(cloudLessonsData);
      } else if (initialAppDataReceived) {
        // Seed lessons if empty
        saveCloudState(store.state, { appData: false, lessons: true });
      }
    }, (err) => {
      console.warn('⚠️ Cloud lessons_data listener warning:', err.message || err);
    });
  } catch (err) {
    console.warn('⚠️ Firestore lessons_data subscribe error:', err);
  }
}
