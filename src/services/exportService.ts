import { Alert, Linking, Share } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { ReflectionItem } from "@/types/reflection";
import { getLocalISODate } from "@/utils/date";

interface SavedReflectionExportEntry {
  id: string;
  date: string;
  formattedDate: string;
  reflection: string;
  categoryValue?: string;
  languageValue?: string | null;
  sourceValue?: string | null;
  note: string;
}

interface SavedReflectionsExportFormatterArgs {
  collectionTitle: string;
  collectionSubtitle: string;
  collectionCountLabel: string;
  exportedOnLabel: string;
  exportedOnValue: string;
  reflectionLabel?: string;
  categoryLabel?: string;
  languageLabel?: string;
  sourceLabel?: string;
  noteLabel?: string;
}

interface SavedReflectionsExportSourceArgs extends SavedReflectionsExportFormatterArgs {
  reflections: ReflectionItem[];
  getNote: (date: string, reflectionId: string) => string;
  getLanguage?: (date: string) => string | null;
  formattedDate: (date: string) => string;
  sourceTypeLabel?: (value: ReflectionItem["sourceType"]) => string;
  categoryValue?: (reflection: ReflectionItem) => string;
}

function sortReflections(reflections: ReflectionItem[]) {
  return [...reflections].sort((left, right) => (left.date < right.date ? -1 : 1));
}

function buildSavedReflectionEntries(args: SavedReflectionsExportSourceArgs): SavedReflectionExportEntry[] {
  return sortReflections(args.reflections).map((reflection) => ({
    id: reflection.id,
    date: reflection.date,
    formattedDate: args.formattedDate(reflection.date),
    reflection: reflection.text,
    categoryValue: args.categoryValue?.(reflection),
    languageValue: args.getLanguage?.(reflection.date) ?? null,
    sourceValue: args.sourceTypeLabel?.(reflection.sourceType) ?? reflection.sourceType,
    note: args.getNote(reflection.date, reflection.id),
  }));
}

function buildReflectionBlock(entry: SavedReflectionExportEntry, options?: SavedReflectionsExportFormatterArgs) {
  const lines = [
    "--------------------------------------------------",
    entry.formattedDate,
    "",
    options?.reflectionLabel ?? "Reflection",
    entry.reflection,
  ];

  if (entry.categoryValue) {
    lines.push("");
    lines.push(options?.categoryLabel ?? "Category");
    lines.push(entry.categoryValue);
  }

  if (entry.languageValue) {
    lines.push("");
    lines.push(options?.languageLabel ?? "Language");
    lines.push(entry.languageValue);
  }

  if (entry.sourceValue) {
    lines.push("");
    lines.push(options?.sourceLabel ?? "Source");
    lines.push(entry.sourceValue);
  }

  if (entry.note.trim()) {
    lines.push("");
    lines.push(options?.noteLabel ?? "Note");
    lines.push(entry.note.trim());
  }

  lines.push("--------------------------------------------------");

  return lines.join("\n");
}

function buildExportHeader(args: {
  collectionTitle: string;
  collectionSubtitle: string;
  collectionCountLabel: string;
  count: number;
  exportedOnLabel: string;
  exportedOnValue: string;
}) {
  return [
    args.collectionTitle,
    args.collectionSubtitle,
    `${args.exportedOnLabel}: ${args.exportedOnValue}`,
    `${args.count} ${args.collectionCountLabel}`,
    "",
  ].join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMultilineHtml(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

async function createExportFile(args: {
  body: string;
  filePrefix: string;
}) {
  const baseDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDirectory) {
    return null;
  }

  const fileUri = `${baseDirectory}${args.filePrefix}-${getLocalISODate()}.txt`;
  await FileSystem.writeAsStringAsync(fileUri, args.body, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return fileUri;
}

async function ensureSharedFile(args: {
  fileUri: string;
  filePrefix: string;
  extension: "txt" | "pdf";
}) {
  const baseDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDirectory) {
    return args.fileUri;
  }

  const targetUri = `${baseDirectory}${args.filePrefix}-${getLocalISODate()}.${args.extension}`;
  if (targetUri === args.fileUri) {
    return targetUri;
  }

  try {
    await FileSystem.copyAsync({
      from: args.fileUri,
      to: targetUri,
    });
    return targetUri;
  } catch {
    return args.fileUri;
  }
}

export function buildSavedReflectionsExport(args: SavedReflectionsExportSourceArgs) {
  const entries = buildSavedReflectionEntries(args);
  if (!entries.length) {
    return "";
  }

  return [
    buildExportHeader({
      collectionTitle: args.collectionTitle,
      collectionSubtitle: args.collectionSubtitle,
      collectionCountLabel: args.collectionCountLabel,
      count: entries.length,
      exportedOnLabel: args.exportedOnLabel,
      exportedOnValue: args.exportedOnValue,
    }),
    entries.map((entry) => buildReflectionBlock(entry, args)).join("\n\n---\n\n"),
  ].join("\n");
}

export function buildSavedReflectionsExportHtml(args: SavedReflectionsExportSourceArgs) {
  const entries = buildSavedReflectionEntries(args);
  if (!entries.length) {
    return "";
  }

  const title = escapeHtml(args.collectionTitle);
  const subtitle = escapeHtml(args.collectionSubtitle);
  const exportedOn = escapeHtml(`${args.exportedOnLabel}: ${args.exportedOnValue}`);
  const countLine = escapeHtml(`${entries.length} ${args.collectionCountLabel}`);
  const reflectionLabel = escapeHtml(args.reflectionLabel ?? "Reflection");
  const categoryLabel = escapeHtml(args.categoryLabel ?? "Category");
  const languageLabel = escapeHtml(args.languageLabel ?? "Language");
  const sourceLabel = escapeHtml(args.sourceLabel ?? "Source");
  const noteLabel = escapeHtml(args.noteLabel ?? "Note");

  const entryMarkup = entries
    .map((entry) => {
      const metaBlocks = [
        entry.categoryValue
          ? `<section class="field"><h3>${categoryLabel}</h3><p>${formatMultilineHtml(entry.categoryValue)}</p></section>`
          : "",
        entry.languageValue
          ? `<section class="field"><h3>${languageLabel}</h3><p>${formatMultilineHtml(entry.languageValue)}</p></section>`
          : "",
        entry.sourceValue
          ? `<section class="field"><h3>${sourceLabel}</h3><p>${formatMultilineHtml(entry.sourceValue)}</p></section>`
          : "",
        entry.note.trim()
          ? `<section class="field note"><h3>${noteLabel}</h3><p>${formatMultilineHtml(entry.note.trim())}</p></section>`
          : "",
      ]
        .filter(Boolean)
        .join("");

      return `
        <article class="entry">
          <div class="entry-separator"></div>
          <h2>${formatMultilineHtml(entry.formattedDate)}</h2>
          <section class="field reflection">
            <h3>${reflectionLabel}</h3>
            <p>${formatMultilineHtml(entry.reflection)}</p>
          </section>
          ${metaBlocks}
        </article>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          margin: 0;
          padding: 52px 44px 60px;
          background: #f8f3ed;
          color: #2f261f;
          font-family: Georgia, "Times New Roman", serif;
          -webkit-font-smoothing: antialiased;
        }
        .document {
          max-width: 720px;
          margin: 0 auto;
        }
        header {
          margin-bottom: 42px;
          padding-bottom: 26px;
          border-bottom: 1px solid #dfd1c3;
        }
        h1 {
          margin: 0 0 10px;
          font-size: 30px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .subtitle {
          margin: 0 0 14px;
          font-size: 15px;
          line-height: 1.7;
          color: #6f6258;
        }
        .meta {
          margin: 0;
          font-size: 12px;
          line-height: 1.8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9b8b7d;
        }
        .entry {
          page-break-inside: avoid;
          margin-bottom: 34px;
        }
        .entry-separator {
          height: 1px;
          background: #dfd1c3;
          margin-bottom: 22px;
        }
        h2 {
          margin: 0 0 18px;
          font-size: 22px;
          font-weight: 600;
        }
        .field {
          margin-bottom: 18px;
        }
        .field h3 {
          margin: 0 0 8px;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #9b8b7d;
        }
        .field p {
          margin: 0;
          font-size: 15px;
          line-height: 1.8;
          white-space: normal;
        }
        .reflection p,
        .note p {
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <main class="document">
        <header>
          <h1>${title}</h1>
          <p class="subtitle">${subtitle}</p>
          <p class="meta">${exportedOn}</p>
          <p class="meta">${countLine}</p>
        </header>
        ${entryMarkup}
      </main>
    </body>
  </html>`;
}

export async function exportSavedReflections(args: {
  subject: string;
  body: string;
  emptyTitle: string;
  emptyMessage: string;
  fallbackTitle: string;
  emailIntro?: string;
  filePrefix: string;
  dialogTitle?: string;
}) {
  if (!args.body.trim()) {
    Alert.alert(args.emptyTitle, args.emptyMessage);
    return;
  }

  const emailBody = args.emailIntro ? `${args.emailIntro}\n\n${args.body}` : args.body;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(args.subject)}&body=${encodeURIComponent(emailBody)}`;
  const canEmail = await Linking.canOpenURL(mailtoUrl);
  if (canEmail) {
    await Linking.openURL(mailtoUrl);
    return;
  }

  const fileUri = await createExportFile({
    body: args.body,
    filePrefix: args.filePrefix,
  });

  if (fileUri && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/plain",
      dialogTitle: args.dialogTitle ?? args.fallbackTitle,
      UTI: "public.plain-text",
    });
    return;
  }

  await Share.share({
    title: args.fallbackTitle,
    message: args.body,
  });
}

export async function exportSavedReflectionsPdf(args: {
  html: string;
  emptyTitle: string;
  emptyMessage: string;
  fallbackTitle: string;
  filePrefix: string;
  dialogTitle?: string;
}) {
  if (!args.html.trim()) {
    Alert.alert(args.emptyTitle, args.emptyMessage);
    return;
  }

  const printResult = await Print.printToFileAsync({
    html: args.html,
    base64: false,
  });

  const fileUri = await ensureSharedFile({
    fileUri: printResult.uri,
    filePrefix: args.filePrefix,
    extension: "pdf",
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/pdf",
      dialogTitle: args.dialogTitle ?? args.fallbackTitle,
      UTI: "com.adobe.pdf",
    });
    return;
  }

  await Share.share({
    title: args.fallbackTitle,
    url: fileUri,
    message: args.fallbackTitle,
  });
}
