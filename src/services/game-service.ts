import {
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    setDoc,
    Timestamp,
    updateDoc
} from "firebase/firestore";
import {db} from "@/lib/firebase/client";
import {Game, Round, Score} from "@/models/types";
import {v4 as uuid} from "uuid";

const gameCollection = collection(db, "games");

// --- CREATE ---
export const createGame = async (hostId: string, playerIds: string[]): Promise<Game> => {
    if (!hostId || !playerIds?.length) throw new Error("Host ID and at least one player are required");

    const newGame: Game = {
        id: uuid(),  // unique game id
        hostId,
        createdAt: Timestamp.now(),
        playerIds,
        state: "Ongoing",
        playerOptions: [],
        rounds: []
    };

    // Use setDoc with a doc reference that matches newGame.id
    const docRef = doc(db, "games", newGame.id);
    await setDoc(docRef, newGame);

    return newGame;
};

// --- READ SINGLE ---
export const getGame = async (id: string): Promise<Game | null> => {
    const docRef = doc(db, "games", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as Game;
};

// --- READ ALL ---
export const getGames = async (): Promise<Game[]> => {
    const snapshot = await getDocs(gameCollection);
    return snapshot.docs.map(doc => doc.data() as Game);
};

// --- UPDATE ---
export const updateGame = async (id: string, data: Partial<Game>): Promise<void> => {
    const docRef = doc(db, "games", id);
    await updateDoc(docRef, data as DocumentData);
};

// --- DELETE ---
export const deleteGame = async (id: string): Promise<void> => {
    const docRef = doc(db, "games", id);
    await deleteDoc(docRef);
};

// --- ADD ROUND ---
export const addRound = async (id: string, scores: Score[]): Promise<void> => {
    const docRef = doc(db, "games", id);
    await updateDoc(docRef, {
        rounds: [...(await getGame(id))!.rounds, {
            id: uuid(),
            createdAt: Timestamp.now(),
            scores
        }]
    });
};

export const addPlayer = async (gameId: string, playerId: string): Promise<void> => {
    const game = await getGame(gameId);
    if (!game) throw new Error("Game not found");

    if (game.playerIds.includes(playerId)) return;

    const updatedRounds: Round[] = game.rounds.map(round => {
        // Calculate average score for this round among existing players
        const totalScore = round.scores.reduce((sum, s) => sum + s.score, 0);
        const playerCount = round.scores.length;
        const avgScore = playerCount > 0 ? totalScore / playerCount : 0;

        // Add new player with average score
        const newScores: Score[] = [
            ...round.scores,
            {playerId, score: avgScore}
        ];

        return {...round, scores: newScores};
    });

    // Update Firestore atomically
    const docRef = doc(db, "games", gameId);
    await updateDoc(docRef, {
        playerIds: [...game.playerIds, playerId],
        rounds: updatedRounds
    });
};

export const removePlayer = async (gameId: string, playerId: string): Promise<void> => {
    const game = await getGame(gameId);
    if (!game) throw new Error("Game not found");

    if (!game.playerIds.includes(playerId)) return; // player not in game

    // Remove playerId from rounds
    const updatedRounds = game.rounds.map(round => ({
        ...round,
        scores: round.scores.filter(score => score.playerId !== playerId),
    }));

    // Remove playerId from playerIds
    const updatedPlayerIds = game.playerIds.filter(id => id !== playerId);

    const docRef = doc(db, "games", gameId);
    await updateDoc(docRef, {
        playerIds: updatedPlayerIds,
        rounds: updatedRounds,
    });
};