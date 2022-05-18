import axios from "axios";

// Play Local Song in Browser
async function playLocalSong(e) {
  // Music Player Styling and Information
  this.albumInfo = JSON.parse(e.target.attributes.music.value);
  this.colors = this.albumInfo.colors;
  this.songName = this.albumInfo.song;
  this.songPath = this.albumInfo.path;
  this.artist = this.albumInfo.artist;
  this.album = this.albumInfo.album;
  this.trackNumber = parseInt(this.albumInfo.tracknumber);

  // Next Song Load Place Holder JSX
  this.nextSongPlaceHolder = (
    <div
      className="musicPlayer"
      style={{
        borderColor: this.colors[0].color4,
        backgroundColor: this.colors[0].color1,
      }}
    ></div>
  );
  this.setState({
    showInSameWindowObject: this.nextSongPlaceHolder,
    musicPlaying: true,
    albumColors: this.colors,
  });

  // Set Song Path / Get Album Tracks from DB.
  let res = await axios.get(`/setmusic`, {
    params: { path: this.songPath, song: this.songName, album: this.album },
  });
  this.albumSongList = res.data;

  // Set Previous / Next Song Values
  for (let i = 0; i < this.albumSongList.length; i++) {
    // Match Track Number to Track Path
    if (this.trackNumber === this.albumSongList[i].TrackNumber) {
      //console.log(`Matched: ${this.albumSongList[i].Path} `);
      this.songPath = this.albumSongList[i].Path;
      // Set Prev Song Values (If Defined)
      if (i >= 1) {
        this.prevSong = this.albumSongList[i - 1].Track;
        this.prevSongTrack = this.albumSongList[i - 1].TrackNumber;
        this.prevSongPath = this.albumSongList[i - 1];
      }
      // Set Next Song Values (If Defined)
      try {
        if (i <= this.albumSongList.length) {
          this.nextSong = this.albumSongList[i + 1].Track;
          this.nextSongTrack = this.albumSongList[i + 1].TrackNumber;
          this.nextSongPath = this.albumSongList[i + 1].Path;
        }
      } catch (err) {
        //Last Song
      }
      break;
    }
  }

  this.nextTrack = {
    artist: this.artist,
    album: this.album,
    tracknumber: this.nextSongTrack,
    song: this.nextSong,
    path: this.nextSongPath,
    colors: this.colors,
  };

  this.prevTrack = {
    artist: this.artist,
    album: this.album,
    tracknumber: this.prevSongTrack,
    song: this.prevSong,
    path: this.nextSongPath,
    colors: this.colors,
  };

  // Create Music Player JSX
  this.musicPlayer = (
    <div
      className="musicPlayer"
      style={{
        borderColor: this.colors[0].color4,
        backgroundColor: this.colors[0].color1,
      }}
    >
      <div className="musicTitleDiv" style={{ color: this.colors[0].color4 }}>
        <h1 className="musicPlayerTitle">{this.songName}</h1>
        <h4
          style={{
            overflow: "hidden",
            height: "24px",
          }}
        >
          {this.album} | {this.artist}
        </h4>
      </div>
      <div className="musicControlsDiv">
        {/* Prev Icon */}
        {this.trackNumber === 1 ? (
          // Hidden Icon for Spacing
          <i className="hiddenSpace musicControls" style={{ width: "36px" }} />
        ) : (
          <button
            className="fas fa-angle-double-left fa-2x musicControls"
            id="musicPrev"
            title={`Previous: ${this.prevSong}`}
            onClick={this.playLocalSong}
            style={{
              color: this.colors[0].color4,
              position: "relative",
              background: "none",
              border: "none",
            }}
            music={JSON.stringify(this.prevTrack)}
          />
        )}
        {this.state.musicPlaying ? (
          <i
            className="fas fa-pause fa-2x musicControls"
            onClick={this.musicControls}
            title="Pause"
            style={{
              color: this.colors[0].color4,
              position: "relative",
            }}
          />
        ) : (
          <i
            className="fas fa-play fa-2x musicControls"
            id="musicPlay"
            title="Play"
            onClick={this.musicControls}
            style={{
              color: this.colors[0].color4,
              position: "relative",
            }}
          />
        )}
        <i
          onClick={this.closeMusicPlayer}
          title="Stop"
          className="fas fa-stop fa-2x musicControls"
          style={{
            color: this.colors[0].color4,
            position: "relative",
            marginLeft: "10px",
          }}
        />
        {/* Next Icon */}
        {this.trackNumber === this.albumSongList.length ? null : (
          <button
            id="musicNext"
            className="fas fa-angle-double-right fa-2x musicControls"
            title={`Next: ${this.nextSong}`}
            onClick={this.playLocalSong}
            style={{
              color: this.colors[0].color4,
              position: "relative",
              background: "none",
              border: "none",
            }}
            music={JSON.stringify(this.nextTrack)}
          />
        )}
        {/* Volume Slider */}
        <div className="musicVolumeSlider">
          <input
            id="musicSlider"
            className="volumeSlider"
            type="range"
            min="0"
            max="100"
            step="1"
            onChange={this.musicVolume}
            style={{
              color: this.colors[0].color4,
              backgroundImage: this.colors[0].color4,
              background: this.colors[0].color4,
            }}
          />
        </div>
      </div>
      {this.albumSongList.length === this.trackNumber ? (
        <audio id="musicPlayer" autoPlay onEnded={this.closeMusicPlayer}>
          <source
            src="/streammusic"
            onError={(e) => {
              alert(
                `Streaming Error: Please confirm path exists or if it is a network drive, the drive is connected. Path: ${this.songPath}`
              );
            }}
            type="audio/ogg"
          />
          <source
            src="/streammusic"
            onError={(e) => {
              alert(
                `Streaming Error: Please confirm path exists or if it is a network drive, the drive is connected. Path: ${this.songPath}`
              );
            }}
            type="audio/mpeg"
          />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <audio
          id="musicPlayer"
          autoPlay
          onEnded={this.playLocalSong}
          music={JSON.stringify(this.nextTrack)}
        >
          <source
            src="/streammusic"
            onError={(e) => {
              alert(
                `Streaming Error: Please confirm path exists or if it is a network drive, the drive is connected. Path: ${this.songPath}`
              );
            }}
            type="audio/ogg"
          />
          <source
            src="/streammusic"
            onError={(e) => {
              alert(
                `Streaming Error: Please confirm path exists or if it is a network drive, the drive is connected. Path: ${this.songPath}`
              );
            }}
            type="audio/mpeg"
          />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );

  this.setState({
    showInSameWindow: true,
    showInSameWindowObject: this.musicPlayer,
    albumColors: this.colors,
  });
}

// Toggle Show / Hide Artist Name on Album Cover
function hideArtist() {
  let list = document.getElementsByClassName("mediaCreator");
  let artistTitleStyle = [];
  if (this.state.artistHidden === true) {
    for (let i = 0; i < list.length; ++i) {
      this.state.artistTitleStyle[i].replace("display: none;", "");
      list[i].setAttribute("style", this.state.artistTitleStyle[i]);
    }
  } else if (this.state.artistHidden === false) {
    for (let i = 0; i < list.length; ++i) {
      artistTitleStyle.push(list[i].getAttribute("style"));
      list[i].setAttribute("style", "display: none;");
    }
  }
  this.setState((prevState) => ({
    artistHidden: !prevState.artistHidden,
    artistTitleStyle: artistTitleStyle,
  }));
}

// Toggle Show / Hide Album Title
function hideAlbumTitle() {
  let list = document.getElementsByClassName("mediaTitle");
  let albumTitleStyle = [];
  if (this.state.albumTitleHidden === true) {
    for (let i = 0; i < list.length; ++i) {
      this.state.albumTitleStyle[i].replace("display: none;", "");
      list[i].setAttribute("style", this.state.albumTitleStyle[i]);
    }
  } else {
    for (let i = 0; i < list.length; ++i) {
      albumTitleStyle.push(list[i].getAttribute("style"));
      list[i].setAttribute("style", "display: none;");
    }
  }
  this.setState((prevState) => ({
    albumTitleHidden: !prevState.albumTitleHidden,
    albumTitleStyle: albumTitleStyle,
  }));
}

// Music Volume Control
function musicVolume(e) {
  this.volume = e.target.value;
  this.newVolume = this.volume / 100;
  document.getElementById("musicSlider").value = e.target.value;
  document.getElementById("musicPlayer").volume = this.newVolume;
}

// Music Controls
function musicControls() {
  this.musicSource = document.getElementById("musicPlayer");
  if (this.state.musicPlaying === true) {
    this.musicSource.pause();
  } else if (this.state.musicPlaying === false) {
    this.musicSource.play();
  }
  this.setState((prevState) => ({
    musicPlaying: !prevState.musicPlaying,
  }));
}

// Close Music Music Player
function closeMusicPlayer() {
  this.setState({
    showInSameWindow: false,
    showInSameWindowObject: null,
  });
}
//// End Media Type Music

export {
  hideArtist,
  hideAlbumTitle,
  playLocalSong,
  musicVolume,
  musicControls,
  closeMusicPlayer,
};
