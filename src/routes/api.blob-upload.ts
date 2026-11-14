import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { createFileRoute } from "@tanstack/react-router";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_SIZE = 10_000_000;

export const Route = createFileRoute("/api/blob-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as HandleUploadBody;
          const response = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
              if (clientPayload !== "dashboard" || !pathname.startsWith("dashboard/")) {
                throw new Error("Jenis unggahan tidak didukung.");
              }
              const { requireDashboardAuth } = await import("@/lib/auth-helpers");
              await requireDashboardAuth();
              return {
                allowedContentTypes: IMAGE_TYPES,
                maximumSizeInBytes: MAX_IMAGE_SIZE,
                addRandomSuffix: true,
              };
            },
            onUploadCompleted: async () => {},
          });
          return Response.json(response);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unggah gagal.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
