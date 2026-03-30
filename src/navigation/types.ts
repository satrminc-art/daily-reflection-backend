import type { ReflectionDetailParams } from "@/types/reflection";

export type RootStackParamList = {
  OnboardingFlow: undefined;
  ReflectionPreview: undefined;
  Membership: undefined;
  Today: undefined;
  ReflectionDetail: ReflectionDetailParams;
  Collections: { reflectionId?: string; date?: string } | undefined;
  CollectionDetail: { collectionId: string };
};

export type TabParamList = {
  Today: undefined;
  Archive: undefined;
  Favorites: undefined;
  Settings: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Language: undefined;
  Name: undefined;
  Intent: undefined;
  Moment: undefined;
  ExactTime: undefined;
  Notifications: undefined;
  StartReady: undefined;
};
