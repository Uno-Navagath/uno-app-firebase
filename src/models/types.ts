import type {Timestamp} from 'firebase/firestore';

export type User = {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
};

export type Player = {
    id: string;
    name: string;
    avatar: string;
};

export type GameState = 'Ongoing' | 'Finished';
export type Game = {
    id: string;
    hostId: string;
    createdAt: Timestamp;
    playerIds: string[];
    playerOptions: PlayerOption[];
    winnerId?: string;
    state: GameState;
    rounds: Round[];
};

export type PlayerOption = {
    id: string;
    averageEnabled: boolean;
}

export type Round = {
    id: string;
    createdAt: Timestamp;
    scores: Score[];
}

export type Score = {
    playerId: string;
    score: number;
};
