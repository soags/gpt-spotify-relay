export function simplifyFollowingArtists(artists: any[]) {
  return artists.map(artist => ({
    name: artist.name,
    genres: artist.genres,
    popularity: artist.popularity,
    id: artist.id
  }));
}