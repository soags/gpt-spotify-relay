export function simplifyTopArtists(items: any[]) {
  return items.map(artist => ({
    name: artist.name,
    genres: artist.genres,
    popularity: artist.popularity,
    id: artist.id
  }));
}