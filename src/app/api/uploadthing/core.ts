import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
const f = createUploadthing();

export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({ image: { maxFileSize: "4MB" } })
        // using zod for runtime validation.
        .input(z.object({ configId: z.string().optional() }))
        // Set permissions and file types for this FileRoute
        .middleware(async ({ input }) => {
            return { input };
        })

        .onUploadComplete(async ({ metadata }) => {
            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            const { configId } = metadata.input;
            return { configId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;