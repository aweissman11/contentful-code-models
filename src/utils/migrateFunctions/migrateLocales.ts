import {
  CollectionProp,
  CreateLocaleProps,
  LocaleProps,
  PlainClientAPI,
} from "contentful-management";
import cloneDeep from "lodash/cloneDeep.js";
import isEqual from "lodash/isEqual.js";
import merge from "lodash/merge.js";
import { ContentfulClientOptions } from "../../types/ClientOptions";

export const handleLocales = async ({
  client,
  options,
  locales,
}: {
  client: PlainClientAPI;
  options: ContentfulClientOptions;
  locales?: CreateLocaleProps[];
}): Promise<void> => {
  const newLocaleIds = [];
  const updatedLocaleIds = [];
  let existingLocales: CollectionProp<LocaleProps> | undefined;

  try {
    if (locales?.length) {
      existingLocales = await client.locale.getMany({
        spaceId: options.spaceId,
        environmentId: options.environmentId,
      });

      for (const locale of locales) {
        const existingLocale = existingLocales.items.find(
          (l) => l.code === locale.code,
        );
        if (existingLocale) {
          const fullUpdatedLocale = merge(
            cloneDeep(existingLocale),
            cloneDeep(locale),
          );
          const isChanged = !isEqual(existingLocale, fullUpdatedLocale);
          if (isChanged) {
            updatedLocaleIds.push(locale.code);
            const updatedLocale = await client.locale.update(
              {
                ...options,
                localeId: existingLocale.sys.id,
              },
              {
                ...fullUpdatedLocale,
                // @ts-expect-error https://github.com/contentful/contentful-management.js/issues/2555
                internal_code: undefined,
              },
            );
            console.log("Updated locale", updatedLocale.code, "✅");
          } else {
            console.log("Locale has not changed, skipping update", locale.code);
          }
        } else {
          newLocaleIds.push(locale.code);
          const createdLocale = await client.locale.create(
            {
              ...options,
            },
            {
              ...locale,
            },
          );
          console.log("Created new locale", createdLocale.code, "✅");
        }
      }

      // deactivate any locales that are not in the new list
      for (const existingLocale of existingLocales.items) {
        if (
          !locales.find((l) => l.code === existingLocale.code) &&
          !existingLocale.default
        ) {
          updatedLocaleIds.push(existingLocale.code);
          await client.locale.update(
            {
              ...options,
              localeId: existingLocale.sys.id,
            },
            {
              ...existingLocale,
              contentDeliveryApi: false,
              contentManagementApi: false,
              optional: true,
              // @ts-expect-error https://github.com/contentful/contentful-management.js/issues/2555
              internal_code: undefined,
            },
          );
          console.log("Deactivated locale", existingLocale.code, "🗑️");
        }
      }
    }
  } catch (error) {
    console.error("\n\n\n\x1b[31m", error, "\n\n\n");
    // roll back locales if any error occurs
    // return updated locales to the previous state
    if (existingLocales) {
      for (const localeId of updatedLocaleIds) {
        const existingLocale = existingLocales.items.find(
          (l) => l.code === localeId,
        );

        if (existingLocale) {
          await client.locale.update(
            {
              ...options,
              localeId: existingLocale.sys.id,
            },
            {
              ...existingLocale,
              // @ts-expect-error https://github.com/contentful/contentful-management.js/issues/2555
              internal_code: undefined,
            },
          );

          console.log("Rolled back locale for", localeId, "🛞⬅️");
        }
      }
    }

    for (const localeId of newLocaleIds) {
      client.locale.delete({
        ...options,
        localeId: localeId,
      });
      console.log("Deleted new locale as part of roll back", localeId, "🗑️");
    }
  }
};
