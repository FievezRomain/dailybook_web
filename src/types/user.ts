import { ImageSigned } from "./image";

export type User = {
  name: string;
  email: string;
  uid: string;
  expotoken: string;
  timezone: string;
  isPremium: boolean;
  image?: string;

  imageSigned?: ImageSigned;
};