
function getAllMaps() {
  return maps;
}

function isMatchingAMap(url) {
  return _.some(maps, (map) => _.invoke(map, "getArtistAlbumTrack", url));
}

function getArtistAlbumTrack(url) {
  const map = _.find(maps, (map) => _.invoke(map, "getArtistAlbumTrack", url));
  if (map) {
    return map.getArtistAlbumTrack(url);
  }
}

//------------ replace below here -------------

const MISC_CATEGORY = "Misc";
const GENAI_CATEGORY = "GenAI";

function sortByKey(array, key) {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    if (typeof x == "string") {
      x = ("" + x).toLowerCase();
    }
    if (typeof y == "string") {
      y = ("" + y).toLowerCase();
    }
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

const maps_raw = [
  {
    name: "Song Meaning",
    category: GENAI_CATEGORY,
    default_check: true,
    domain: "bing.com",
    description: "Song Meaning",
    getUrl(artist, album, track) {
      // https://www.bing.com/search?q=what+is+the+meaning+of+the+song+%22what+is+love%22+performed+by+Haddaway
      return (
        "https://www.bing.com/search?q=what+is+the+meaning+of+the+song+%22" + track + "%22+performed+by+%22" + artist + "%22"
      );
    },
    getArtistAlbumTrack(url) {
      // anywhere, TODO: grep values
      if ((match = url.match(/bing\.com\//))) {
        return [, ,];
      }
    },
  },
  {
    name: "Artist",
    category: GENAI_CATEGORY,
    default_check: true,
    domain: "bing.com",
    description: "Artist Facts",
    getUrl(artist, album, track) {
      return (
        "https://www.bing.com/search?q=who+is+%22" + artist + "%22"
      );
    },
    getArtistAlbumTrack(url) {
      // anywhere, TODO: grep values
      if ((match = url.match(/bing\.com\//))) {
        return [, ,];
      }
    },
  },
  {
    name: "Album",
    category: GENAI_CATEGORY,
    default_check: true,
    domain: "bing.com",
    description: "Album Facts",
    getUrl(artist, album, track) {
      return (
        "https://www.bing.com/search?q=Facts+about+Album+%22" + artist + "%22+by+%22" + artist + "%22"
      );
    },
    getArtistAlbumTrack(url) {
      // anywhere, TODO: grep values
      if ((match = url.match(/bing\.com\//))) {
        return [, ,];
      }
    },
  },  
  {
    name: "Spotify",
    category: MISC_CATEGORY,
    default_check: true,
    domain: "spotify.com",
    description: "Start here!",
    getUrl(artist, album, track) {
      // https://open.spotify.com/search/Pamplamoose%20lovely%20day
      return (
        "https://open.spotify.com/search/" +
        artist +
        "%20" +
        album +
        "%20 " +
        track
      );
    },
    getArtistAlbumTrack(url) {
      // anywhere
      if ((match = url.match(/open\.spotify\.com\//))) {
        return [, ,];
      }
    },
  },
  {
    name: "Last.fm",
    category: MISC_CATEGORY,
    default_check: true,
    domain: "last.fm",
    description: "Start here!",
    getUrl(artist, album, track) {
      // Startpage
      if (!track && !album && !artist) {
        return "https://www.last.fm/home";
      }
      // https://www.last.fm/music/Chlorosounds+Music
      if (!track && !album) {
        artist = artist ? artist.replace(/ /g, "+") : "";
        return "https://www.last.fm/music/" + artist;
      }
      // https://www.last.fm/music/Chlorosounds+Music/_/Baraccuda
      else if (!album) {
        album = "_";
      }
      // space to +
      artist = artist ? artist.replace(/ /g, "+") : "";
      album = album ? album.replace(/ /g, "+") : "";
      track = track ? track.replace(/ /g, "+") : "";
      return "https://www.last.fm/music/" + artist + "/" + album + "/" + track;
    },
    getArtistAlbumTrack(url) {
      // https://www.last.fm/music/FleetwoodMac/Rumors/The+Chain
      if (
        (match = url.match(
          /last\.fm\/music\/([\w\%\+\-\*]*)\/([\w\%\+\-\*]*)\/([\w\%\+\-\*]*)/
        ))
      ) {
        let [, artist, album, track] = match;
        // https://www.last.fm/music/Chlorosounds+Music/_/Baraccuda
        if (album == "_") {
          album = "";
        }
        // + to space
        artist = artist ? artist.replace(/\+/g, " ") : "";
        album = album ? album.replace(/\+/g, " ") : "";
        track = track ? track.replace(/\+/g, " ") : "";
        return [artist, album, track];
      }
      // https://www.last.fm/music/FleetwoodMac/Rumors
      else if (
        (match = url.match(/last\.fm\/music\/([\w\%\-\+\*]*)\/([\w\%\+\-\*]*)/))
      ) {
        let [, artist, album, track] = match;
        // + to space
        artist = artist ? artist.replace(/\+/g, " ") : "";
        album = album ? album.replace(/\+/g, " ") : "";
        track = track ? track.replace(/\+/g, " ") : "";
        return [artist, album, track];
      } else if (
        // https://www.last.fm/music/N*E*R*D
        (match = url.match(/last\.fm\/music\/([\w\%\+\-\*]*)$/))
      ) {
        let [, artist, album, track] = match;
        // + to space
        artist = artist ? artist.replace(/\+/g, " ") : "";
        album = album ? album.replace(/\+/g, " ") : "";
        track = track ? track.replace(/\+/g, " ") : "";
        return [artist, album, track];
      }
    },
  },
  {
    // Still Issues with Umlauts in Artist. jumping to https://beta.musixmatch.com/artist/Christina-St%C3%BCrmer
    // while https://beta.musixmatch.com/lyrics/Silbermond/Leichtes-Gep%C3%A4ck works!
    name: "MusixMatch",
    category: MISC_CATEGORY,
    default_check: true,
    domain: "musixmatch.com",
    description: "Lyrics, Credits",
    getUrl(artist, album, track) {
      // space to -
      artist = artist ? artist.replace(/ /g, "-") : "";
      album = album ? album.replace(/ /g, "-") : "";
      track = track ? track.replace(/ /g, "-") : "";
      // https://beta.musixmatch.com/artist/Goo-Goo-Dolls
      if (!track) {
        return "https://beta.musixmatch.com/artist/" + artist;
      }
      // https://beta.musixmatch.com/lyrics/Goo-Goo-Dolls/Iris
      return "https://beta.musixmatch.com/lyrics/" + artist + "/" + track;
    },
    getArtistAlbumTrack(url) {
      let match;
      if ((match = url.match(/musixmatch\.com\/artist\/([\w\%\+\-\*]*)/))) {
        let [, artist, album, track] = match;
        // - to space
        artist = artist ? artist.replace(/\-/g, " ") : "";
        album = album ? album.replace(/\-/g, " ") : "";
        track = track ? track.replace(/\-/g, " ") : "";
        return [artist, album, track];
      } else if (
        (match = url.match(
          /musixmatch\.com\/lyrics\/([\w\%\+\-\*]*)\/([\w\%\+\-\*]*)/
        ))
      ) {
        let [, artist, track, album] = match;
        // - to space
        artist = artist ? artist.replace(/\-/g, " ") : "";
        album = album ? album.replace(/\-/g, " ") : "";
        track = track ? track.replace(/\-/g, " ") : "";
        return [artist, album, track];
      }
    },
  },
  {
    name: "Musicbrainz",
    category: MISC_CATEGORY,
    default_check: true,
    domain: "musicbrainz.org",
    description: "Credits, Wiki, Social",
    getUrl(artist, album, track) {
      // https://musicbrainz.org/search?query=madonna&type=artist
      if (!track && !album) {
        return (
          "https://musicbrainz.org/search?query=" + artist + "&type=artist"
        );
      } else if (!track) {
        // https://musicbrainz.org/search?query=type%3Aalbum+AND+holiday+AND+artist%3AMadonna&type=release&limit=100&method=advanced
        return (
          "https://musicbrainz.org/search?query=type%3Aalbum+AND+" +
          album +
          "+AND+artist%3A" +
          artist +
          "&type=release&limit=100&method=advanced"
        );
      } else if (!album) {
        // https://musicbrainz.org/search?query=%22Want+Me+Back%22+AND+artist%3ALindsay+Ell&type=recording&limit=100&method=advanced
        return (
          "https://musicbrainz.org/search?query=%22" +
          track +
          "%22+AND+artist%3A" +
          artist +
          "&type=recording&limit=100&method=advanced"
        );
      }
      // https://musicbrainz.org/search?query=%22Second+Hand+News%22+AND+artist%3AFleetwood+Mac+AND+album%3ARumors&type=recording&limit=100&method=advanced
      return (
        "https://musicbrainz.org/search?query=%22" +
        track +
        "%22+AND+artist%3A" +
        artist +
        "+AND+album%3A" +
        album +
        "&type=recording&limit=100&method=advanced"
      );
    },
    getArtistAlbumTrack(url) {
      // no scraping of artist, album & track possible from this site
    },
  },
  {
    name: "Songfacts",
    category: MISC_CATEGORY,
    default_check: true,
    domain: "songfacts.com",
    description: "Artist/Song Facts",
    getUrl(artist, album, track) {
      // https://www.songfacts.com/songs/led-zeppelin
      if (!track) {
        artist = artist ? artist.replace(/ /g, "-") : "";
        return "https://www.songfacts.com/songs/" + artist;
      }
      // https://www.songfacts.com/facts/led-zeppelin/immigrant-song
      // space to -
      artist = artist ? artist.replace(/ /g, "-") : "";
      track = track ? track.replace(/ /g, "-") : "";
      return "https://www.songfacts.com/facts/" + artist + "/" + track;
    },
    getArtistAlbumTrack(url) {
      // https://www.songfacts.com/facts/led-zeppelin
      // https://www.songfacts.com/songs/led-zeppelin
      let match;
      if ((match = url.match(/songfacts\.com\/(facts|songs)\/([\w\-\+\*]*)/))) {
        let [, , artist] = match;
        // - to space
        artist = artist ? artist.replace(/\-/g, " ") : "";
        return [artist, ,];
      }
    },
  },
];

const maps = sortByKey(maps_raw, "name");
