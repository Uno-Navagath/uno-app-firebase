import {db} from '@/lib/firebase/client';
import type {Player, User} from '@/models/types';
import {collection, doc, documentId, getDoc, getDocs, query, setDoc, where,} from 'firebase/firestore';

const playerCollection = collection(db, 'players');

export async function createOrUpdatePlayer(user: User): Promise<Player> {
    const documentReference = doc(playerCollection, user.uid);
    const documentSnapshot = await getDoc(documentReference);

    if (documentSnapshot.exists()) {
        // We could update the user's details (name, photo) here if they've changed.
        // For now, just return existing data.
        return {id: user.uid, ...documentSnapshot.data()} as Player;
    } else {
        // Create a new player profile for the user
        const newPlayer: Omit<Player, 'id'> = {
            name: user.displayName || 'Anonymous',
            avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
        };
        await setDoc(documentReference, newPlayer);
        return {id: user.uid, ...newPlayer};
    }
}

export async function getPlayer(uid: string): Promise<Player | null> {
    const documentSnapshot = await getDoc(doc(playerCollection, uid));
    if (documentSnapshot.exists()) {
        return {id: uid, ...documentSnapshot.data()} as Player;
    }
    return null;
}

export async function getAllPlayers(): Promise<Player[]> {
    const snapshot = await getDocs(playerCollection);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Player));
}

export async function getPlayers(uids: string[]): Promise<Player[]> {
    if (uids.length === 0) {
        return [];
    }
    const q = query(playerCollection, where(documentId(), 'in', uids));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Player));
}
