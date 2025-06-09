export function simplifyPlaylists(items: any[]) {
  return items.map(p => ({
    name: p.name,
    id: p.id,
    trackCount: p.tracks.total,
    public: p.public,
    owner: p.owner.display_name
  }));
}