import axios from "axios";

// Get Base64 Image
async function getLocalPhoto(photoPath) {
  let res = await axios.post(`/api/photo`, {
    data: photoPath,
  });
  let photo = res.data;
  if (photo === "Error") {
    this.setState({
      isLoading: false,
      noMediaFound: true,
    });
  } else {
    return photo;
  }
}

// Show Bigger Preview of Photo
async function showPhoto(e) {
  this.fullSizeImage = e.target.value;
  this.name = e.target.name;
  console.info(`Show Photo Called. Title ${this.name}`);
  this.imagePreview = (
    <div>
      <h1 className="showInBrowserTitle">{this.name}</h1>
      <img
        onClick={this.showPhoto}
        className="showInBrowserImage"
        src={this.fullSizeImage}
        alt=""
        title="Click To Close"
      ></img>
    </div>
  );
  this.setState((prevState) => ({
    showInBrowser: !prevState.showInBrowser,
    showInBrowserObject: this.imagePreview,
    scrollHidden: true,
  }));
}

export { getLocalPhoto, showPhoto };
