// src/notion/notion.ts

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = "2022-06-28";

export async function fetchNotion(
  path: string,
  query: any,
  method: string = "GET",
  body: any = null
) {
  const searchParams = new URLSearchParams(query);
  const url = `https://api.notion.com${path}?${searchParams.toString()}`;

  return await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": NOTION_VERSION,
    },
    body: body ? JSON.stringify(body) : null,
  });
}