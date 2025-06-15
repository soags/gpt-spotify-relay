import { Request, Response } from "express";
import { db, SPOTIFY_COLLECTIONS } from "../../lib/firestore";
import { GenreAnalysisResponse } from "../../types/spotify/response";

export async function getGenreAnalysis(
  req: Request,
  res: Response<GenreAnalysisResponse>
): Promise<void> {
  const col = db.collection(SPOTIFY_COLLECTIONS.ARTISTS);
  const snapshot = await col.get();

  if (snapshot.empty) {
    res.json({
      genres: [],
      total: 0,
      message:
        "アーティストデータが保存されていません（/artists/refresh を実行してください）",
    });
    return;
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
}
