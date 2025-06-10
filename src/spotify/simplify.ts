// 🎧 トップトラック（GET /me/top/tracks）
export const simplifyTopTracks = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    artists: item.artists.map((a: any) => a.name),
    duration_ms: item.duration_ms,
    url: item.external_urls?.spotify,
  }));
};

// 🧑‍🎤 トップアーティスト（GET /me/top/artists）
export const simplifyTopArtists = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    genres: item.genres,
    followers: item.followers.total,
    popularity: item.popularity,
    url: item.external_urls?.spotify,
  }));
};

// 💾 保存済みトラック（GET /me/tracks）
export const simplifySavedTracks = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.track.id,
    name: item.track.name,
    artists: item.track.artists.map((a: any) => a.name),
    duration_ms: item.track.duration_ms,
    url: item.track.external_urls?.spotify,
  }));
};

// 💿 保存済みアルバム（GET /me/albums）
export const simplifySavedAlbums = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.album.id,
    name: item.album.name,
    release_date: item.album.release_date,
    total_tracks: item.album.total_tracks,
    url: item.album.external_urls?.spotify,
  }));
};

// 📌 フォロー中アーティスト（GET /me/following?type=artist）
export const simplifyFollowingArtists = (data: any) => {
  return data.artists.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    genres: item.genres,
    followers: item.followers.total,
    popularity: item.popularity,
    url: item.external_urls?.spotify,
  }));
};

// 📂 自分のプレイリスト一覧（GET /me/playlists）
export const simplifyPlaylists = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    tracks: item.tracks.total,
    url: item.external_urls?.spotify,
  }));
};

// 📁 プレイリスト詳細（GET /playlists/:id）
export const simplifyPlaylist = (data: any) => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    tracks: data.tracks.total,
    url: data.external_urls?.spotify,
  };
};

// 🎵 プレイリスト内トラック一覧（GET /playlists/:id/tracks）
export const simplifyPlaylistTracks = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.track.id,
    name: item.track.name,
    artists: item.track.artists.map((a: any) => a.name),
    duration_ms: item.track.duration_ms,
    url: item.track.external_urls?.spotify,
  }));
};

// 💿 アルバム詳細（GET /albums/:id）
export const simplifyAlbum = (data: any) => {
  return {
    id: data.id,
    name: data.name,
    release_date: data.release_date,
    total_tracks: data.total_tracks,
    url: data.external_urls?.spotify,
  };
};

// 💽 アルバム内トラック一覧（GET /albums/:id/tracks）
export const simplifyAlbumTracks = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    duration_ms: item.duration_ms,
    track_number: item.track_number,
    url: item.external_urls?.spotify,
  }));
};

// 🎧 トラック単体（GET /tracks/:id）
export const simplifyTrack = (data: any) => {
  return {
    id: data.id,
    name: data.name,
    artists: data.artists.map((a: any) => a.name),
    duration_ms: data.duration_ms,
    url: data.external_urls?.spotify,
  };
};

// 🧑‍🎤 アーティスト単体（GET /artists/:id）
export const simplifyArtist = (data: any) => {
  return {
    id: data.id,
    name: data.name,
    genres: data.genres,
    followers: data.followers.total,
    popularity: data.popularity,
    url: data.external_urls?.spotify,
  };
};

// 🧑‍🎤 アーティストのトップトラック（GET /artists/:id/top-tracks）
export const simplifyArtistTopTracks = (data: any) => {
  return data.tracks.map((track: any) => ({
    id: track.id,
    name: track.name,
    artists: track.artists.map((a: any) => a.name),
    duration_ms: track.duration_ms,
    url: track.external_urls?.spotify,
  }));
};
