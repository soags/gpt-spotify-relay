import { getPage } from './notion';
import { simplifyPage } from './simplify';

export const routeRequest = async (path: string, query: any) => {
  // 例: /v1/pages/<id>
  const match = path.match(/^\/v1\/pages\/([^\/]+)$/);
  if (match) {
    const pageId = match[1];
    const raw = await getPage(pageId);
    return simplifyPage(raw);
  }

  throw {
    response: {
      status: 404,
      data: { error: 'Unsupported Notion API path' }
    }
  };
};