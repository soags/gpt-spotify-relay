import { Request, Response } from "express";
import { COLLECTIONS, db } from "../lib/firestore";

export const getGenreAnalysis = async (req: Request, res: Response) => {
  const col = db.collection(COLLECTIONS.ARTISTS);
  const snapshot = await col.get();

  if (snapshot.empty) {
    return res.json({
      genres: [],
      total: 0,
      message:
        "アーティストデータが保存されていません（/artists/refresh を実行してください）",
    });
  }

  const genreMap: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (!data.genres || !Array.isArray(data.genres)) return;

    data.genres.forEach((genre: string) => {
      genreMap[genre] = (genreMap[genre] || 0) + 1;
    });
  });

  const sortedGenres = Object.entries(genreMap)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);

  res.json({
    genres: sortedGenres,
    total: sortedGenres.reduce((acc, g) => acc + g.count, 0),
  });
};
