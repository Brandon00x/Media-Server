import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// Get Season Data for TV Show
async function getSeason(e) {
  try {
    this.iLoopValue = null;
    this.setXLoopValue = null;
    this.seasonsJsx = [];
    this.episodeJsx = [];
    this.showProps = JSON.parse(e.target.value);
    this.showPropsJson = JSON.stringify(this.showProps);

    console.info(`Get Season Called for ${this.showProps.Title}`);
    let res = await axios.post(`/api/getseason`, {
      data: this.showProps.Title,
    });

    this.seasonObject = res.data;
    this.totalSeasons = parseInt(this.seasonObject[0].data[0].totalSeasons);
    if (this.totalSeasons === 1) {
      this.allSeasons = this.seasonObject[0].data[0].content[0].Data.Episodes;
    } else if (this.totalSeasons > 1) {
      this.allSeasons = this.seasonObject[0].data[0].content[0].Data.seasonObj;
      await this.allSeasons.sort(function (a, b) {
        return a.Season - b.Season;
      });
    }

    console.log("All Season Length", this.allSeasons.length);
    this.iLoopValue = this.totalSeasons === 1 ? 1 : this.allSeasons.length;
    console.log("I LOOP VALUE", this.iLoopValue);
    this.setXLoopValue =
      this.totalSeasons === 1
        ? this.allSeasons.length - 1
        : this.allSeasons[0].Episodes.length - 1;

    console.log(`X Loop ${this.setXLoopValue}`);
  } catch (err) {
    console.error(`Error Handling Season Information. ${err}`);
  }
  // Create Season
  // try {
  let x = 0; // Episodes In Season
  // I Total Seasons
  for (let i = 0; i < this.iLoopValue; i++) {
    do {
      if (this.iLoopValue === 1) {
        this.episode = this.allSeasons[x].Episode;
        this.path = this.allSeasons[x].Path;
      } else if (this.iLoopValue > 1) {
        this.episode = this.allSeasons[0].Episodes[x].Episode;
        this.path = this.allSeasons[0].Episodes[x].Path;
      }

      this.episodeJsx.push(
        <div key={uuidv4()} className="episodesJsx">
          <ul className="episodeJsxUl">Episode: {this.episode}</ul>
          <ul className="episodeJsxUlPath">Path: {this.path}</ul>
          <div className="episodesJsxButtonDiv">
            <button
              className="episodeJsxButton"
              onClick={this.openInBrowser}
              value={this.showPropsJson}
            >
              Stream
            </button>
            <button
              className="episodeJsxButton"
              onClick={this.openMedia}
              value={this.showPropsJson}
            >
              Open
            </button>
            <button className="episodeJsxButton">Description</button>
          </div>
        </div>
      );
      x += 1;
    } while (x <= this.setXLoopValue);
    x = 0;
    this.seasonsJsx.push(
      <div key={uuidv4()} className="seasonsJsx">
        <h1>
          Season: {this.iLoopValue === 1 ? 1 : this.allSeasons[i].Season}{" "}
        </h1>
        <h3>
          Total Episodes:{" "}
          {this.iLoopValue === 1
            ? this.allSeasons.length
            : this.allSeasons[i].Episodes.length}
        </h3>
        <div>{this.episodeJsx}</div>
      </div>
    );
    this.episodeJsx = [];
  }
  // } catch (err) {
  //   console.error(`Season Creation Error ${err}`);
  // }
  // Define Season Preview JSX Element with Data Above
  this.seasonPreview = (
    <div>
      <div className="seasonsPreview">
        <div className="seasonsPreviewTitleDiv">
          <div className="seasonsShowTitle">{this.showProps.Title}</div>
          <div className="seasonsShowSubTitle">
            Total Seasons: {this.totalSeasons}
          </div>
          <div className="seasonsShowSubTitle2">
            File Location:{" "}
            <span style={{ fontStyle: "italic" }}>{this.showProps.Path} </span>
            <button
              className="fas fa-external-link-alt"
              value={this.showPropsJson}
              onClick={this.openMedia}
            ></button>
          </div>
          <i
            onClick={this.closeBrowserMedia}
            className="far fa-times-circle fa-2x closeCircle"
            style={{ left: "126%", top: "-66%" }}
          ></i>
        </div>
        <div className="seasonsPreviewImgDiv">
          <img src={this.showProps.Img} alt="" className="seasonsPreviewImg" />
        </div>
      </div>
      <div className="episodesJsxRoot">{this.seasonsJsx}</div>
    </div>
  );
  // Render Season(s) In Component: Show In Browser
  this.setState((prevState) => ({
    showInBrowser: !prevState.showInBrowser,
    showInBrowserObject: this.seasonPreview,
    scrollHidden: true,
  }));
}
//// End Media Type TV Shows

export { getSeason };
