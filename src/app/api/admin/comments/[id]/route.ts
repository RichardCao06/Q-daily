import { moderateComment, requireAuthenticatedSupabase } from "@/lib/reader-service";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;

  try {
    const { status } = (await request.json()) as { status?: "approved" | "rejected" | "hidden" };
    const auth = await requireAuthenticatedSupabase(request.headers);

    await moderateComment(auth.supabase, auth.user.id, id, status ?? "approved");

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 401 },
    );
  }
}
