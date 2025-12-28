// firebase/auth.js

import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,      
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const doSendSignInLink = (email) => {
  const actionCodeSettings = {
    
    url: `${window.location.origin}/login`, 
    handleCodeInApp: true,
  };
  
  return sendSignInLinkToEmail(auth, email, actionCodeSettings);
};

export const doSignInWithLink = async (email, href) => {
  if (isSignInWithEmailLink(auth, href)) {
    return signInWithEmailLink(auth, email, href);
  }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    // Это позволит увидеть конкретную причину ошибки (например, INVALID_PASSWORD)
    console.error("Firebase Auth Error:", error.code, error.message);
    throw error; // Пробрасываем ошибку дальше в компонент Login
  }
};


export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  
  return result; 
};
export const doSignInWithGithub = async () => {
    const provider = new GithubAuthProvider();
    provider.addScope('user:email'); 
    const result = await signInWithPopup(auth, provider);
    return result;
};



export const doSignOut = () => {
  return auth.signOut();
};

export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
};