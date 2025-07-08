import type { ContentModel } from "../types";
import { fiftyFifty } from "./fiftyFifty";
import { generalContent } from "./generalContent";
import { seo } from "./seo";
import { landingPage } from "./landingPage";
import { simpleHero } from "./simpleHero";
import { link } from "./link";
import { CreateLocaleProps } from "contentful-management";

export const models: ContentModel[] = [
  fiftyFifty,
  generalContent,
  seo,
  landingPage,
  simpleHero,
  link,
];

export const locales: CreateLocaleProps[] = [
  {
    code: "en-US",
    name: "English (USA)",
    default: true,
  },
  {
    code: "es-US",
    name: "Spanish (US)",
    fallbackCode: "en-US",
    optional: true,
  },
  // {
  //   code: "es-MX",
  //   name: "Spanish (MX)",
  //   optional: true,
  //   // fallbackCode: "en-US", // <= Will fall back to en US by default
  // },
  // {
  //   code: "en-MX",
  //   name: "English (MX)",
  //   optional: true,
  //   fallbackCode: "es-MX",
  // },
];
