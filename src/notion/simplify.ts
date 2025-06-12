// src/notion/simplify.ts

type NotionTitleProperty = {
  type: "title";
  title: { plain_text: string }[];
};

function simplifyPage(data: any) {
  return {
    id: data.id,
    title: extractTitle(data),
    created_time: data.created_time,
    last_edited_time: data.last_edited_time,
    url: data.url,
  };
}

function simplifyDatabaseQuery(data: any) {
  return data.results.map((page: any) => simplifyPage(page));
}

function extractTitle(data: {
  properties: { [key: string]: NotionTitleProperty };
}): string {
  try {
    const titleProp = Object.values(data.properties).find(
      (prop) => prop.type === "title"
    ) as NotionTitleProperty | undefined;

    if (
      !titleProp ||
      !Array.isArray(titleProp.title) ||
      titleProp.title.length === 0
    ) {
      return "";
    }
    return titleProp.title.map((t) => t.plain_text).join("");
  } catch {
    return "";
  }
}

export function simplifyNotionResponse(path: string, query: any, data: any) {
  if (path.startsWith("/v1/pages/")) {
    return simplifyPage(data);
  }
  if (path.startsWith("/v1/databases/") && path.endsWith("/query")) {
    return simplifyDatabaseQuery(data);
  }

  return data;
}
