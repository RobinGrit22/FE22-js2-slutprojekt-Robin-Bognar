// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, deleteUser as firebaseDeleteUser } from 'firebase/auth';
import { getDatabase, ref, set, get, push, update } from 'firebase/database';
export {createUserWithEmailAndPassword}

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCN1Jajc93QLNy2svLcSEikRTS2z-j6jV0",
  authDomain: "js2slutprojekt.firebaseapp.com",
  databaseURL: "https://js2slutprojekt-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "js2slutprojekt",
  storageBucket: "js2slutprojekt.appspot.com",
  messagingSenderId: "837320577778",
  appId: "1:837320577778:web:581458fa13f3ea083f366b"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();

//Hantera error
type FirebaseAuthError = {
  code: string;
  message: string;
};


// Lägg till användare till auth och realtime funktion
export const createUserAccount = async (email: string, password: string, username: string, imageSrc: string) => {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Sparaa användare till realtime
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`); // Reference to the user's data
    await set(userRef, {
      username: username,
      image: imageSrc
    });
    return userCredential; 
  } catch (error) {
    const err = error as FirebaseAuthError;
    const errorCode = err.code;
    const errorMessage = err.message;
    console.log(errorCode, errorMessage)
  }
};



// Logga in
export const logInAccount = (email: string, password: string): Promise<void> => {
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
    const user = userCredential.user;
  });
};




// Logga ut
export const logOutAccount = async (): Promise<void> => {
  const auth = getAuth();
  try {
    await firebaseSignOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};


//radera konto
export const deleteAccount = async (): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      // Delete user from the Realtime Database
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, null);

      // Delete user from the Authentication
      await firebaseDeleteUser(user);
      console.log("User account deleted");
    } catch (error) {
      console.error("Error deleting user account:", error);
    }
  } else {
    console.error("No user is currently signed in");
  }
};



//Inlägg
export const createPost = async (userId: string, content: string) => {
  const db = getDatabase();
  const postsRef = ref(db, 'posts');
  const newPostRef = push(postsRef);
  await set(newPostRef, {
    userId: userId,
    content: content,
    createdAt: new Date().toISOString(),
    likes: 0,
  });
};


//hämta användare
export const fetchUsers = async () => {
  const productsRef = ref(database, 'users');
  const productsSnapshot = await get(productsRef);
  const users = productsSnapshot.val();
  return users;
};


//Uppdatera likes
export const updateLikes = async ( postId: string, newLikes: number) => {
  const db = getDatabase();
  const postRef = ref(db, `posts/${postId}`);
  await update(postRef, { likes: newLikes });
};