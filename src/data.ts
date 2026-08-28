import type { VaultFile } from "./types";

export const files: VaultFile[] = [
  {
    id: "f1",
    name: "site-backup-2026-08.tar.gz",
    kind: "archive",
    sizeMb: 842,
    storedAt: "2 hours ago",
    shared: true,
    expiresIn: "6 days",
  },
  {
    id: "f2",
    name: "trainer-build-release.apk",
    kind: "archive",
    sizeMb: 61,
    storedAt: "yesterday",
    shared: true,
  },
  {
    id: "f3",
    name: "conference-keynote.mp4",
    kind: "video",
    sizeMb: 1240,
    storedAt: "3 days ago",
    shared: false,
  },
  {
    id: "f4",
    name: "invoice-q3-final.pdf",
    kind: "document",
    sizeMb: 2.4,
    storedAt: "1 week ago",
    shared: false,
  },
  {
    id: "f5",
    name: "field-recording-master.wav",
    kind: "audio",
    sizeMb: 318,
    storedAt: "2 weeks ago",
    shared: true,
    expiresIn: "1 day",
  },
];

export const usedGb = 6.4;
export const totalGb = 10;
