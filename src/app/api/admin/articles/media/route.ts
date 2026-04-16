import { getBearerTokenFromHeaders } from "@/lib/auth/session";
import { uploadAdminArticleMedia } from "@/lib/article-management-service";

export async function POST(request: Request) {
  try {
    const accessToken = getBearerTokenFromHeaders(request.headers) ?? undefined;
    const formData = await request.formData();
    const slug = formData.get("slug");
    const kind = formData.get("kind");
    const alt = formData.get("alt");
    const file = formData.get("file");

    if (
      typeof slug !== "string" ||
      (kind !== "hero" && kind !== "inline") ||
      !file ||
      typeof file !== "object" ||
      !("arrayBuffer" in file) ||
      !("name" in file)
    ) {
      throw new Error("Invalid media upload payload");
    }

    const result = await uploadAdminArticleMedia(
      {
        slug,
        kind,
        alt: typeof alt === "string" ? alt : undefined,
        file: file as File,
      },
      accessToken,
    );

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to upload article media",
      },
      { status: 400 },
    );
  }
}
