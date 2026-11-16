import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

const SLUG_PATTERN = /^[a-z0-9-]{1,100}$/;

export type EventMetadataInfo = {
  title: string;
  description: string;
  imageUrl: string;
};

function makeDescription(text: string) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 155 ? `${flat.slice(0, 155).trimEnd()}…` : flat;
}

// Cloudinary can crop the cover to the 1200x630 size social apps expect.
function shareImage(url: string) {
  return url.includes("res.cloudinary.com") && url.includes("/upload/")
    ? url.replace(
        "/upload/",
        "/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/",
      )
    : url;
}

// Cached for a short time so the page title doesn't need a database trip every time.
export async function getEventMetadata(
  slug: string,
): Promise<EventMetadataInfo | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("events", `event:${slug}`);

  if (!SLUG_PATTERN.test(slug)) return null;

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      imageUrl: true,
      status: true,
    },
  });

  // Drafts are private, so they never reveal their title.
  if (!event || event.status === "DRAFT") return null;

  return {
    title: event.title,
    description: makeDescription(event.description),
    imageUrl: shareImage(event.imageUrl),
  };
}