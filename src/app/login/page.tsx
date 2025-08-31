import React from 'react';
import Image from "next/image";
import FirebaseLogin from "./components/firebase-login";

function Login() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="UNO Logo"
                        width={40}
                        height={40}
                    />
                    <h1 className="text-3xl font-bold">UNO</h1>
                </div>
                <p className="text-muted-foreground">Sign in to track your game scores</p>
            </div>

            <FirebaseLogin/>
        </div>
    );
}

export default Login;