import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildOgSvg } from "./ogCard";
import {
  injectPreview,
  inviteDescription,
  inviteTitle,
  previewVersion,
  shareMessage,
} from "./sharePreview";

const fields = {
  childName: "Sophie",
  title: "Sophie's 6th birthday",
  date: "2026-12-12",
  location: "The Imperial, Chelsea",
  description: "From 2pm to 4pm\n\nBring a jumper",
};

describe("share preview", () => {
  it("writes the invitation the way a parent would say it", () => {
    expect(inviteTitle(fields)).toBe("Sophie's 6th birthday");
    expect(inviteDescription(fields)).toBe("Saturday 12 December · 2pm to 4pm · The Imperial, Chelsea");
    expect(shareMessage(fields)).toBe(
      "You're invited to Sophie's 6th birthday\nSaturday 12 December · 2pm to 4pm · The Imperial, Chelsea",
    );
  });

  it("puts that invitation into the tags WhatsApp and iMessage read", () => {
    const html = readFileSync("index.html", "utf8");
    const version = previewVersion(["art", "Sophie's 6th birthday"]);
    const next = injectPreview(html, {
      title: "Sophie's 6th birthday",
      description: "Saturday 12 December · The Imperial, Chelsea",
      url: "https://partypalapp.netlify.app/party/11111111-1111-4111-8111-111111111111",
      image: `https://partypalapp.netlify.app/og/11111111-1111-4111-8111-111111111111.jpg?v=${version}`,
      imageAlt: "Sophie's 6th birthday invitation",
    });
    expect(next).toContain("<title>Sophie's 6th birthday</title>");
    expect(next).toContain('<meta property="og:title" content="Sophie\'s 6th birthday">');
    expect(next).not.toContain("Party Planning Made Simple");
    expect(next).toContain('property="og:image:width" content="1200"');
    expect(next).toContain('property="og:image:type" content="image/jpeg"');
    expect(next).toContain(`v=${version}`);
    expect(next.match(/property="og:image"/g)).toHaveLength(1);
  });

  it("escapes a name that could break the preview markup", () => {
    const svg = buildOgSvg({
      name: "Tom & Jerry",
      line: "is turning 5",
      detail: "Saturday 12 December",
      background: "#F9F7FC",
      text: "#282035",
      muted: "#71677F",
      accent: "#6B7AFF",
    });
    expect(svg).toContain("Tom &amp; Jerry");
    expect(svg).not.toContain("Tom & Jerry");
  });
});
