import axios from "axios";

// Play Movie in Browser
async function playInBrowser(e) {
  this.movieObject = JSON.parse(e.target.value);
  let path = this.movieObject.Path;
  this.name = e.target.name;
  this.poster = this.movieObject.Img;
  this.ext = this.movieObject.Ext;
  console.info(
    `Play In Browser Called. Title: ${this.name}. Extension: ${this.ext}`
  );
  // Set Movie / TV Video Path.
  let res = await axios.get(`/api/setvideo/`, {
    params: { data: path },
  });
  if (res.data) {
    // Create Movie Player JSX
    this.moviePlayer = (
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

    // Render Show In Browser Component
    this.setState((prevState) => ({
      showInBrowser: !prevState.showInBrowser,
      showInBrowserObject: this.moviePlayer,
      scrollHidden: true,
    }));
    this.scrollToTop();
  }
}

export { playInBrowser };
