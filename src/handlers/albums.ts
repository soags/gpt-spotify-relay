export function simplifyAlbums(items: any[]) {
  return items.map(entry => {
    const album = entry.album;
    return {
      name: album.name,
      artists: album.artists.map((a: any) => a.name),
      release_date: album.release_date,
      total_tracks: album.total_tracks,
      id: album.id
    };
  });
}
