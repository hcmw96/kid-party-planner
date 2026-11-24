import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { encode as encodeJpeg } from "jpeg-js";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { buildOgSvg, type OgCard } from "../../src/lib/ogCard";

let ready: Promise<void> | null = null;
let fonts: Uint8Array[] | null = null;

function locate(candidates: string[]): string {
  const found = candidates.find((path) => existsSync(path));
  if (!found) throw new Error(`Missing a file needed to draw the invitation`);
  return found;
}

async function ensureReady(): Promise<Uint8Array[]> {
  if (!fonts) {
    const dir = locate([join(process.cwd(), "netlify/lib/fonts")]);
    const [extraBold, medium] = await Promise.all([
      readFile(join(dir, "Manrope-ExtraBold.ttf")),
      readFile(join(dir, "Manrope-Medium.ttf")),
    ]);
    fonts = [new Uint8Array(extraBold), new Uint8Array(medium)];
  }
  if (!ready) {
    const wasmPath = locate([join(process.cwd(), "node_modules/@resvg/resvg-wasm/index_bg.wasm")]);
    ready = readFile(wasmPath).then((wasm) => initWasm(wasm));
  }
  await ready;
  return fonts;
}

export async function renderOgJpeg(card: OgCard): Promise<Uint8Array> {
  const fontBuffers = await ensureReady();
  const resvg = new Resvg(buildOgSvg(card), {
    fitTo: { mode: "width", value: 1200 },
    font: {
      fontBuffers,
      defaultFontFamily: "Manrope Medium",
      sansSerifFamily: "Manrope Medium",
    },
  });
  const pending = resvg.imagesToResolve() as string[];
  if (pending.length > 0 && card.imageHref?.startsWith("data:")) {
    const bytes = dataUriBytes(card.imageHref);
    for (const href of pending) resvg.resolveImage(href, bytes);
  }
  const rendered = resvg.render();
  const pixels = new Uint8Array(rendered.pixels);
  const width = rendered.width;
  const height = rendered.height;
  rendered.free();
  resvg.free();
  const encoded = encodeJpeg({ data: pixels, width, height }, 78);
  return new Uint8Array(encoded.data);
}

function dataUriBytes(href: string): Uint8Array {
  const comma = href.indexOf(",");
  return Uint8Array.from(Buffer.from(href.slice(comma + 1), "base64"));
}

export async function artworkHref(artUrl: string | null | undefined): Promise<string | null> {
  if (!artUrl || !/^https:\/\//i.test(artUrl)) return null;
  const response = await fetch(artUrl);
  if (!response.ok) return null;
  const type = (response.headers.get("content-type") ?? "image/png").split(";")[0].trim();
  if (!type.startsWith("image/")) return null;
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > 8_000_000) return null;
  return `data:${type};base64,${Buffer.from(bytes).toString("base64")}`;
}
