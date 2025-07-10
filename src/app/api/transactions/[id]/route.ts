import { NextRequest, NextResponse } from "next/server";
import {
    getUserIdFromRequest,
} from "../../../../lib/firebaseAdmin";
import { db } from "../../../../lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Missing user ID" }, { status: 401 });
        }

        const { id } = await params;
        const docRef = doc(db, "transactions", id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists())
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        const data = docSnap.data();
        if (data.userId !== userId)
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const update = await req.json();
        await updateDoc(docRef, update);
        return NextResponse.json({ id, ...update });
    } catch (error) {
        console.error("Error updating transaction:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Missing user ID" }, { status: 401 });
        }

        const { id } = await params;
        const docRef = doc(db, "transactions", id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        const data = docSnap.data();
        if (data.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await deleteDoc(docRef);
        return NextResponse.json({ id });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
