import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { NextRequest } from "next/server";

const firebaseAdminConfig = {
    credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY!,
    }),
};

const app = getApps().length
    ? getApps()[0]
    : initializeApp(firebaseAdminConfig);
export const adminAuth = getAuth(app);

const verifyIdToken = async (token: string) => {
    try {
        return await adminAuth.verifyIdToken(token);
    } catch (error) {
        console.error("Error verifying token:", error);
        throw new Error("Invalid or expired token");
    }
}

export async function getUserIdFromRequest(
    req: NextRequest
): Promise<string | null> {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return null;
    }
    try {
        const token = authHeader.replace("Bearer ", "");
        const decoded = await verifyIdToken(token);
        return decoded.uid;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}
