export const isDespia = navigator.userAgent.toLowerCase().includes("despia");

type DespiaFn = (command: string) => Promise<void>;

let despiaPromise: Promise<DespiaFn> | null = null;

function getDespia(): Promise<DespiaFn | null> {
  if (!isDespia) return Promise.resolve(null);
  if (!despiaPromise) {
    despiaPromise = import("despia-native").then((mod) => mod.default);
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
