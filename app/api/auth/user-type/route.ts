import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { authMiddleware } from "@/lib/middleware/auth";

/**
 * @swagger
 * /api/auth/user-type:
 *  get:
 *     summary: Get user type (student or company)
 *     description: Get the type of user (student or company)
 *     tags:
 *      - Authentication
 */
export async function GET(request: Request) {
    // Authenticate the user
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) {
        return auth; // Return the NextResponse if authentication fails
    }
    // Extract user type from authentication
    const {type} = auth

    return NextResponse.json({ userType: type });
}