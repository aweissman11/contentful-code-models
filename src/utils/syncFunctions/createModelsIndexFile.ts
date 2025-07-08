import { ContentTypeProps, LocaleProps } from "contentful-management";
import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function createModelsIndexFile({
  modelsDir,
  contentModels,
  locales,
}: {
  modelsDir: string;
  contentModels: ContentTypeProps[];
  locales: LocaleProps[];
}) {
  try {
    const filePath = path.join(modelsDir, "index.ts");

    await mkdir(path.dirname(filePath), { recursive: true });

    const modelIds = contentModels.map(({ sys }) => sys.id);

    const importStatements = modelIds
      .map((id) => `import { ${id} } from "./${id}";`)
      .join("\n");

    const exportedModelList = modelIds.join(", ");

    const localesList = locales
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ sys, ...rest }) => ({
        ...rest,
      }))
      .map((locale) => JSON.stringify(locale));

    const exportedLocalesList = localesList.join(", ");

    const fileContent = `
      import type { ContentModel } from 'contentful-code-models';
      ${importStatements}

      export const models: ContentModel[] = [${exportedModelList}];

      export const locales = [${exportedLocalesList}];
    `.trim();

    await writeFile(filePath, fileContent, "utf8");
    console.log(`Successfully created ${filePath}`);
  } catch (error) {
    console.error("Error creating models index file:", error);
  }
}
