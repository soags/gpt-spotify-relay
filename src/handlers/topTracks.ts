export function simplifyTopTracks(items: any[]) {
  return items.map(track => ({
    name: track.name,
    artists: track.artists.map((a: any) => a.name),
    album: track.album.name,
    preview_url: track.preview_url,
    id: track.id
  }));
}