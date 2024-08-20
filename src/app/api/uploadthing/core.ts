import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import sharp from "sharp"
import { db } from "@/db";

const f = createUploadthing();

// sever side function
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({ image: { maxFileSize: "4MB" } })
        // using zod for runtime validation.
        .input(z.object({ configId: z.string().optional() }))
        // Set permissions and file types for this FileRoute
        .middleware(async ({ input }) => {
            return { input };
        })

        .onUploadComplete(async ({ metadata, file }) => {
            // !!! Whatever is returned here is sent to the client side `onClientUploadComplete` callback
            const { configId } = metadata.input;
            const res = await fetch(file.url);
            const buffer = await res.arrayBuffer();
            const imageMetadata = await sharp(buffer).metadata();
            const { width, height } = imageMetadata;
            if (!configId) {
                const configuration = await db.configuration.create({
                    data: {
                        imageUrl: file.url,
                        width: width || 500,
                        height: height || 500
                    }
                });
                return { configId: configuration.id };
            } else {
                const updatedConfiguration = await db.configuration.update({
                    where: {
                        id: configId
                    },
                    data: {
                        croppedImageUrl: file.url,
                    }
                });
                return { configId: updatedConfiguration.id };
            }
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;