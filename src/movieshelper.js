import axios from "axios";

// Play Movie in Browser
async function playInBrowser(e, isMovie) {
  if (isMovie === false) {
    console.info(`Play TV Show Called`);
    this.tvObject = JSON.parse(e.target.value);
    this.path = this.tvObject[2];
    this.name = this.tvObject[3];

    this.closeButton = this.player = (
      <div>
        <i
          value={this.name}
          onClick={() => {
            this.getSeason(this.name);
          }}
          className="far fa-times-circle fa-2x closeCircle"
          style={{ position: "absolute", left: "97%", top: "9%" }}
        ></i>
        <video
          id="videoPlayer"
          className="tvPlayer"
          controls
          autoPlay
          poster={this.poster}
        >
          <source
            src={`/api/video/`}
            type="video/mp4"
            onError={(e) => {
              alert(
                `Unable to stream ${this.name}. Please confirm drive is connected and file exists.`
              );
              this.getSeason(this.name);
            }}
          />
        </video>
      </div>
    );
  } else {
    this.movieObject = JSON.parse(e.target.value);
    this.path = this.movieObject.Path;
    this.name = e.target.name;
    this.poster = this.movieObject.Img;
    this.ext = this.movieObject.Ext;
    this.player = (
      <div>
        <h1 className="showInBrowserTitle">{this.name}</h1>
        <i
          onClick={this.closeBrowserMedia}
          className="far fa-times-circle fa-2x closeCircle"
          style={{ position: "absolute", left: "97%", top: "9%" }}
        ></i>
        <video
          id="videoPlayer"
          style={{ width: "100vw", height: "83vh" }}
          controls
          autoPlay
          poster={this.poster}
        >
          <source src={`/api/video/`} type="video/mp4" />
        </video>
      </div>
    );
    console.info(
      `Play Movie Called. Title: ${this.name}. Extension: ${this.ext}`
    );
  }

  // Set Movie / TV Video Path.
  let res = await axios.get(`/api/setvideo/`, {
    params: { data: this.path },
  });
  if (res.data) {
    // Render Show In Browser Component
    this.setState({
      showInBrowser: true,
      showInBrowserObject: this.player,
      scrollHidden: true,
    });
    this.scrollToTop();
  }
}

export { playInBrowser };
