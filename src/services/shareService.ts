import React from "react";
import { Share } from "react-native";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

export async function shareViewAsImage(
  viewRef: React.RefObject<unknown>,
  options?: {
    dialogTitle?: string;
    message?: string;
  },
): Promise<void> {
  const localUri = await captureRef(viewRef, {
    format: "png",
    quality: 1,
  });

  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(localUri, {
      mimeType: "image/png",
      dialogTitle: options?.dialogTitle,
    });
    return;
  }

  await Share.share({
    url: localUri,
    message: options?.message,
  });
}
