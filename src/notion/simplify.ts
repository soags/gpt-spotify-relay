export const simplifyPage = (data: any) => {
  return {
    id: data.id,
    created_time: data.created_time,
    last_edited_time: data.last_edited_time,
    properties: data.properties, // 必要に応じてさらに簡略化可
  };
};