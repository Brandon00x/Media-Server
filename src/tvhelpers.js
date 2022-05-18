import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// Get Season Data for TV Show
async function getSeason(e) {
  try {
    this.showProps = JSON.parse(e.target.value);
    this.showPropsJson = JSON.stringify(this.showProps);
    console.info(`Get Season Called for ${this.showProps.Title}`);
    let res = await axios.post(`/api/getseason`, {
      data: this.showProps.Title,
    });
    this.seasonObject = res.data;

    this.seasonsJsx = [];
    this.episodeJsx = [];
    let checkOneSeason;
    try {
      if (this.seasonObject[0].Data.length) {
        checkOneSeason = true;
      } else if (this.seasonObject[0].Data.seasonObj.length >= 1) {
        checkOneSeason = false;
        // Sort Seasons Numerically
        await this.seasonObject[0].Data.seasonObj.sort(function (a, b) {
          return a.Season - b.Season;
        });
      }
    } catch (err) {
      checkOneSeason = true;
    }

    // Only One Season
    if (checkOneSeason) {
      this.totalSeasons = 1;
      // Create JSX for One Season
      for (let x = 0; x < this.seasonObject[0].Data.Episodes.length; x++) {
        let episode = this.seasonObject[0].Data.Episodes[x].Episode;
        let path = this.seasonObject[0].Data.Episodes[x].Path;
        this.episodeJsx.push(
          <div key={uuidv4()} className="episodesJsx">
            <ul className="episodeJsxUl">Episode: {episode}</ul>
            <ul className="episodeJsxUlPath">Path: {path}</ul>
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
      }
      this.seasonsJsx.push(
        <div key={uuidv4()} className="seasonsJsx">
          <h3>Total Episodes: {this.seasonObject[0].Data.Episodes.length}</h3>
          <div>{this.episodeJsx}</div>
        </div>
      );
    }
    // More than 1 Season
    else {
      this.totalSeasons = this.seasonObject[0].Data.seasonObj.length;
      let x = 0;
      // Create JSX for Multiple Seasons
      for (let i = 0; i < this.seasonObject[0].Data.seasonObj.length; i++) {
        do {
          this.episode =
            this.seasonObject[0].Data.seasonObj[i].Episodes[x].Episode;
          let path = this.seasonObject[0].Data.seasonObj[i].Episodes[x].Path;
          this.episodeJsx.push(
            <div key={uuidv4()} className="episodesJsx">
              <ul className="episodeJsxUl">Episode: {this.episode}</ul>
              <ul className="episodeJsxUlPath">Path: {path}</ul>
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
        } while (
          x <=
          this.seasonObject[0].Data.seasonObj[i].Episodes.length - 1
        );
        x = 0;
        this.seasonsJsx.push(
          <div key={uuidv4()} className="seasonsJsx">
            <h1>Season: {this.seasonObject[0].Data.seasonObj[i].Season} </h1>
            <h3>
              Total Episodes:{" "}
              {this.seasonObject[0].Data.seasonObj[i].Episodes.length}
            </h3>
            <div>{this.episodeJsx}</div>
          </div>
        );
        this.episodeJsx = [];
      }
    }
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
              <span style={{ fontStyle: "italic" }}>
                {this.showProps.Path}{" "}
              </span>
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
            <img
              src={this.showProps.Img}
              alt=""
              className="seasonsPreviewImg"
            />
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
  } catch (err) {
    console.error(`Error Generating Season Data: ${err}`);
  }
}
//// End Media Type TV Shows

export { getSeason };
