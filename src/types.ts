export type FileKind = "document" | "image" | "archive" | "audio" | "video";

export interface VaultFile {
  id: string;
  name: string;
  kind: FileKind;
  sizeMb: number;
  storedAt: string;
  shared: boolean;
  expiresIn?: string;
}
