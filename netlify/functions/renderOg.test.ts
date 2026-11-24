import { describe, expect, it } from "vitest";
import { artworkHref, renderOgJpeg } from "./renderOg";

const sophie = {
  name: "Sophie",
  line: "is turning 6",
  detail: "Saturday 12 December · 2pm to 4pm · The Imperial, Chelsea",
  background: "#F9F7FC",
  text: "#282035",
  muted: "#71677F",
  accent: "#6B7AFF",
};

describe("invitation card image", () => {
  it("renders a small landscape card when there is no painting", async () => {
    const jpeg = Buffer.from(await renderOgJpeg(sophie));
    expect(jpeg.subarray(0, 3).toString("hex")).toBe("ffd8ff");
    expect(jpeg.byteLength).toBeLessThan(200_000);
  });

  it("lays the name over the painted background", async () => {
    const imageHref = await artworkHref(
      "https://gbkfxfqjavvojewjwkvq.supabase.co/storage/v1/object/public/invite-art/e1df43a5-9dd9-4466-8ced-2a1fa2e67868.png",
    );
    expect(imageHref).toMatch(/^data:image\//);
    const jpeg = Buffer.from(await renderOgJpeg({ ...sophie, name: "Henry", imageHref }));
    expect(jpeg.subarray(0, 3).toString("hex")).toBe("ffd8ff");
    expect(jpeg.byteLength).toBeLessThan(300_000);
  });
});
