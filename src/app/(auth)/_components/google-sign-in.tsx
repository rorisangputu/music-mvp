
import { FcGoogle } from "react-icons/fc";
import React from "react";
import { signInWithGoogle } from "@/lib/googleOauth";


const GoogleSignIn = () => {
    return (
        <form
            action={signInWithGoogle}
        >
            <button className="w-full flex cursor-pointer items-center justify-center gap-4 bg-black py-3 rounded-xl text-white">
                <FcGoogle className="w-6 h-6" />
                Continue with Google
            </button>
        </form>
    );
};

export default GoogleSignIn;