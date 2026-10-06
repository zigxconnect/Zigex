import "server-only";
import { getProgramContent, getProgramEnrollment } from "@/lib/api/services/programs";

/** Raw program_content rows for a program (backend: GET /programs/{id}/content). */
export const getProgramContentCached = (programId: string) => getProgramContent(programId);

/** The signed-in student's enrollment in a program. `_userId` is kept for existing callers. */
export async function getStudentEnrollment(programId: string, _userId?: string) {
    return getProgramEnrollment(programId);
}
