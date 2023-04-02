import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  CollectionReference,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { DEV } from ".";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(config, "client");

export const database = getFirestore(app);
export const auth = getAuth(app);

class Fluxus {
  address: string;
  collection: CollectionReference<DocumentData>;
  path: string = DEV ? "fluxus-dev" : "fluxus";
  constructor(address: string) {
    this.address = address;
    this.collection = collection(database, this.path);
  }

  async getUsers() {
    return await getDocs(this.collection);
  }

  async getUser() {
    return await getDoc(doc(this.collection, `${this.address}`));
  }

  async addOrUpdateUser(data: any) {
    return await setDoc(doc(this.collection, `${this.address}`), data, {
      merge: true,
    });
  }

  async getConstantFluxus() {
    return await getDocs(
      collection(database, this.path, `${this.address}`, "constantFlux")
    );
  }

  async getConstantFlux(constantFluxPda: string) {
    return await getDoc(
      doc(
        this.collection,
        `${this.address}`,
        "constantFlux",
        `${constantFluxPda}`
      )
    );
  }

  async addOrUpdateConstantFlux(constantFluxPda: string, data: any) {
    return await setDoc(
      doc(
        this.collection,
        `${this.address}`,
        "constantFlux",
        `${constantFluxPda}`
      ),
      data,
      { merge: true }
    );
  }
}

export { addDoc, getDocs, getDoc, doc, collection, setDoc, Fluxus, Timestamp };
