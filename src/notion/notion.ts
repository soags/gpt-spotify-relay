import axios from 'axios';

const NOTION_API_BASE = 'https://api.notion.com';
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = '2022-06-28';

export const getPage = async (pageId: string) => {
  const url = `${NOTION_API_BASE}/v1/pages/${pageId}`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION
    }
  });

  return res.data;
};