import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  CollectionReference,
  query,
  type DocumentData,
} from "firebase/firestore";
import { get, writable } from "svelte/store";
import { auth, db } from "../util/firebaseSetup";
import type { components } from "./bkk-openapi";

export type savedStop = components["schemas"]["TransitStop"] & {
  routeRef?: {
    [key: string]: components["schemas"]["TransitRoute"] | undefined;
  };
};

export const savedStops = writable<savedStop[]>([]);

export const editMode = writable(false);

export const user = writable<User | null>(null); // FIXME can't assign null
export const stopsRef = writable<CollectionReference<DocumentData>>();
// it would be much more difficult to correctly type this
let unsubData: any;

onAuthStateChanged(auth, async (currentUser) => {
  user.set(currentUser);
  if (currentUser) {
    const { onSnapshot } = await import("firebase/firestore");
    stopsRef.set(collection(db, `userdata/${currentUser.uid}/stops`));

    const q = query(get(stopsRef));
    unsubData = onSnapshot(q, (snap) => {
      const stops: savedStop[] = [];
      snap.forEach((doc) => stops.push(doc.data()));
      savedStops.set(stops);
    });
  } else {
    unsubData && unsubData();
  }
});
