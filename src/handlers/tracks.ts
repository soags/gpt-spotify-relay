export function simplifyTracks(items: any[]) {
  return items.map(entry => {
    const track = entry.track;
    return {
      name: track.name,
      artists: track.artists.map((a: any) => a.name),
      album: track.album.name,
      added_at: entry.added_at,
      id: track.id
    };
  });
}
