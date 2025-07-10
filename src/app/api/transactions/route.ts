import { NextRequest, NextResponse } from "next/server";
import {
    getUserIdFromRequest,
} from "../../../lib/firebaseAdmin";
import { db } from "../../../lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Missing user ID" }, { status: 401 });
        }

        const q = query(
            collection(db, "transactions"),
            where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(q);
        const transactions = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Missing user ID" }, { status: 401 });
        }

        const newTransaction = await req.json();
        const docRef = await addDoc(collection(db, "transactions"), {
            ...newTransaction,
            userId,
            createdAt: serverTimestamp(),
        });

        return NextResponse.json({ id: docRef.id, ...newTransaction });
    } catch (error) {
        console.error("Error adding transaction:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
