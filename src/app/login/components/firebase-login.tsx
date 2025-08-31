'use client'

import {auth, googleProvider} from "@/lib/firebase/client";
import {signInWithPopup} from "@firebase/auth";
import {Button} from "@/components/ui/button";
import {LogIn} from "lucide-react";
import {useState} from "react";


const FirebaseLogin = () => {

    const [loading, setLoading] = useState(false);

    async function handleGoogleAuth() {
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
        setLoading(false);
    }

    return (
        <Button
            variant="outline"
            size="lg"
            disabled={loading}
            className="flex items-center gap-2"
            onClick={handleGoogleAuth}
        >
            <LogIn/>
            {loading && <span>Loading...</span>}
            {!loading && <span>Sign in with Google</span>}
        </Button>
    );
};

export default FirebaseLogin;