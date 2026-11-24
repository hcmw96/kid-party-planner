export const isDespia = navigator.userAgent.toLowerCase().includes("despia");

type DespiaFn = {
  (command: string): Promise<void>;
  (command: string, watch: string[]): Promise<Record<string, unknown>>;
};

let despiaPromise: Promise<DespiaFn> | null = null;

function getDespia(): Promise<DespiaFn | null> {
  if (!isDespia) return Promise.resolve(null);
  if (!despiaPromise) {
    despiaPromise = import("despia-native").then((mod) => mod.default as DespiaFn);
  }
  return despiaPromise;
}

const HAPTIC_SCHEMES = {
  light: "lighthaptic://",
  heavy: "heavyhaptic://",
  success: "successhaptic://",
  warning: "warninghaptic://",
  error: "errorhaptic://",
} as const;

export async function haptic(type: keyof typeof HAPTIC_SCHEMES): Promise<void> {
  const despia = await getDespia();
  if (!despia) return;
  await despia(HAPTIC_SCHEMES[type]);
}

export async function nativeShare(message: string, url: string): Promise<void> {
  if (isDespia) {
    const despia = await getDespia();
    if (despia) {
      await despia(
        `shareapp://message?=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`
      );
      return;
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({ text: message, url });
      return;
    } catch {
      // User cancelled or share failed — fall through to clipboard
    }
  }

  await navigator.clipboard.writeText(url);
}

export async function setStatusBarColor(rgb: string): Promise<void> {
  const despia = await getDespia();
  if (!despia) return;
  await despia(`statusbarcolor://${rgb}`);
}

export async function setStatusBarTextColor(
  color: "black" | "white",
): Promise<void> {
  const despia = await getDespia();
  if (!despia) return;
  await despia(`statusbartextcolor://${color}`);
}

export async function showSpinner(): Promise<void> {
  const despia = await getDespia();
  if (!despia) return;
  await despia("spinneron://");
}

export async function hideSpinner(): Promise<void> {
  const despia = await getDespia();
  if (!despia) return;
  await despia("spinneroff://");
}

export async function registerPush(userId: string): Promise<void> {
  const despia = await getDespia();
  if (!despia) return;
  await despia(`setonesignalplayerid://?user_id=${encodeURIComponent(userId)}`);
}

export type ActionSheetItem = {
  label: string;
  value: string;
  iconIos?: string;
  iconAndroid?: string;
  destructive?: boolean;
};

export async function showActionSheet(opts: {
  title: string;
  items: ActionSheetItem[];
  theme?: "light" | "dark" | "system";
}): Promise<string | null> {
  if (!isDespia) return null;

  return new Promise((resolve) => {
    (window as Window & { onSheetEvent?: (value: string | null) => void }).onSheetEvent =
      (value) => {
        resolve(value);
      };

    void getDespia().then((despia) => {
      if (!despia) {
        resolve(null);
        return;
      }
      const params = new URLSearchParams({
        title: opts.title,
        items: JSON.stringify(opts.items),
        theme: opts.theme ?? "light",
      });
      void despia(`actionsheet://?${params.toString()}`);
    });
  });
}

export async function saveImageToPhotos(url: string): Promise<void> {
  const despia = await getDespia();
  if (!despia) return;
  await despia(`savethisimage://?url=${encodeURIComponent(url)}`);
}

export async function requestAppRating(): Promise<void> {
  const despia = await getDespia();
  if (!despia) return;
  await despia("rateapp://");
}

/** Schedule a local notification. delaySeconds from now. */
export async function scheduleLocalPush(opts: {
  title: string;
  body: string;
  delaySeconds: number;
  url?: string;
}): Promise<void> {
  const despia = await getDespia();
  if (!despia) return;
  const params = new URLSearchParams({
    title: opts.title,
    body: opts.body,
    delay: String(Math.max(1, Math.floor(opts.delaySeconds))),
  });
  if (opts.url) params.set("url", opts.url);
  await despia(`sendlocalpushmsg://?${params.toString()}`);
}

export function maybeRequestRatingAfterFirstParty(): void {
  try {
    const key = "partypal_parties_created";
    const count = Number(localStorage.getItem(key) || "0") + 1;
    localStorage.setItem(key, String(count));
    if (count === 1) {
      void requestAppRating();
    }
  } catch {
    // localStorage unavailable — skip
  }
}
