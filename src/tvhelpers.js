import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { scrollToTop } from "./utilhelpers";

// Get Season Data for TV Show
async function getSeason(e) {
  try {
    this.seasonsJsx = [];
    this.episodeJsx = [];
    this.showProps = JSON.parse(e.target.value);
    this.showPropsJson = JSON.stringify(this.showProps);

    let res = await axios.post(`/api/getseason`, {
      data: this.showProps.Title,
    });

    this.seasonObject = res.data;
  } catch (err) {
    console.error(`Error: Unable to get season data from server. ${err}`);
  }

  try {
    this.metaData = await setShowMetaData(this.seasonObject);
  } catch (err) {
    console.error(err);
  }

  if (this.seasonObject.indexOf("No Search Results Found") !== -1) {
    console.error(`NO MATCHING SHOW FOUND`);
    return;
  }

  // Set Number of Seasons
  try {
    this.seasonDataObj = this.seasonObject[0].data[0].content[0].Data.seasonObj;
    this.totalSeasons = this.seasonDataObj.length;
  } catch (err) {
    this.totalSeasons = 1;
  }

  // Create Seasons List
  // Show Has 1 Season
  if (this.totalSeasons === 1) {
    try {
      this.singleSeasonEpisodes =
        this.seasonObject[0].data[0].content[0].Data.Episodes;

      if (typeof this.singleSeasonEpisodes === "undefined") {
        this.singleSeasonEpisodes =
          this.seasonObject[0].data[0].content[0].Data.seasonObj[0].Episodes;
      }

      this.episodeJsx.push(
        <div className="newSeasonBreak" key={uuidv4()}>
          <div className="newSeasonBreakText" style={{ fontWeight: "bold" }}>
            Season: 1
          </div>
          <div className="newSeasonBreakText episodeText">
            Episodes: {this.singleSeasonEpisodes.length}
          </div>
        </div>
      );

      for (let i = 0; i < this.singleSeasonEpisodes.length; i++) {
        this.episode = this.singleSeasonEpisodes[i].Episode;
        this.path = this.singleSeasonEpisodes[i].Path;

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
      }
    } catch (err) {
      console.error(`Error Creating Episode List for 1 Season. ${err}`);
    }
  }
  // More Than 1 Season
  else if (this.totalSeasons > 1) {
    try {
      this.allSeasonData =
        this.seasonObject[0].data[0].content[0].Data.seasonObj;

      await this.allSeasonData.sort(function (a, b) {
        return a.Season - b.Season;
      });

      for (let i = 0; i < this.allSeasonData.length; i++) {
        let x = 0;
        this.seasonEpisodeCount = this.allSeasonData[i].Episodes;
        // Push Season Information:
        this.episodeJsx.push(
          <div className="newSeasonBreak" key={uuidv4()}>
            <div className="newSeasonBreakText" style={{ fontWeight: "bold" }}>
              Season: {this.allSeasonData[i].Season}
            </div>
            <div className="newSeasonBreakText episodeText">
              Episodes: {this.allSeasonData[i].Episodes.length}
            </div>
          </div>
        );

        // Push Episode, Path, Action Buttons.
        do {
          this.episode = this.allSeasonData[i].Episodes[x].Episode;
          this.path = this.allSeasonData[i].Episodes[x].Path;

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
        } while (x < this.seasonEpisodeCount.length);
      }
    } catch (err) {
      console.error(
        `Error Creating Episode Lists for Multiple Seasons. ${err}`
      );
    }
  }

  this.seasonsJsx.push(
    <div className="seasonsJsx" key={uuidv4()}>
      <div>{this.episodeJsx}</div>
    </div>
  );
  this.episodeJsx = [];

  // Define Season Preview JSX Element with Data Above
  this.seasonPreview = (
    <div id="seasonContainer" className="seasonContainer">
      <div className="seasonsPreview">
        <div className="seasonsPreviewTitleDiv">
          <div className="seasonTitleImageBlock">
            <div className="seasonsShowTitle">{this.showProps.Title}</div>
            <div className="seasonShowDescription">
              {this.metaData.description}
            </div>
          </div>
        </div>

        {/* ROW 1 */}
        <div className="seasonsInfoPanel">
          <div className="seasonsShowSubTitle">
            Actors:{" "}
            <span className="seasonsShowSubTitleInfo">
              {this.metaData.actors}
            </span>
          </div>
          <div className="seasonsShowSubTitle">
            Genre:{" "}
            <span className="seasonsShowSubTitleInfo">
              {this.metaData.genre}
            </span>
          </div>

          <div className="seasonsYearDiv">
            <div className="seasonsShowSubTitle">
              Rating:
              <br />
              <span className="seasonsShowSubTitleInfo">
                {this.metaData.rated}
              </span>
            </div>
            <div className="seasonsShowSubTitle" style={{ marginLeft: "2vw" }}>
              Local Seasons:
              <br />
              <span className="seasonsShowSubTitleInfo">
                {this.totalSeasons}
              </span>
            </div>
            <div className="seasonsShowSubTitle" style={{ marginLeft: "2vw" }}>
              Episode Time:
              <br />
              <span className="seasonsShowSubTitleInfo">
                {this.metaData.length}
              </span>
            </div>
            <div className="seasonsShowSubTitle" style={{ marginLeft: "2vw" }}>
              Released: <br />
              <span className="seasonsShowSubTitleInfo">
                {this.metaData.released}
              </span>
            </div>
            <div className="seasonsShowSubTitle" style={{ marginLeft: "2vw" }}>
              Years: <br />
              <span className="seasonsShowSubTitleInfo">
                {this.metaData.showDate}
              </span>
            </div>
          </div>

          {/* AWARDS ROW */}
          <div className="seasonsAwards">
            <div className="seasonsShowSubTitle">
              IMDB Rating:
              <br />
              <span className="seasonsShowSubTitleInfo">
                {this.metaData.imdbRating}
              </span>
            </div>
            <div className="seasonsShowSubTitle" style={{ marginLeft: "2vw" }}>
              Metascore:
              <br />
              <span className="seasonsShowSubTitleInfo">
                {this.metaData.metaScoreRating}
              </span>
            </div>
          </div>
          <div className="seasonsShowSubTitle">
            Awards:{" "}
            <span className="seasonsShowSubTitleInfo">
              {this.metaData.awards}.
            </span>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="seasonsInfoPanel">
          <div className="seasonsShowSubTitle">
            Language:{" "}
            <span className="seasonsShowSubTitleInfo">
              {this.metaData.language}
            </span>
          </div>
          <div className="seasonsShowSubTitle">
            Country:{" "}
            <span className="seasonsShowSubTitleInfo">
              {this.metaData.country}
            </span>
          </div>
          {this.metaData.creator === "N/A" ? null : (
            <div className="seasonsShowSubTitle">
              Creator:{" "}
              <span className="seasonsShowSubTitleInfo">
                {this.metaData.creator}
              </span>
            </div>
          )}
          {this.metaData.writers === null ? null : (
            <div className="seasonsShowSubTitle">
              Writers:{" "}
              <span className="seasonsShowSubTitleInfo">
                {this.metaData.writers}
              </span>
            </div>
          )}
        </div>

        <div className="seasonsShowSubTitle">
          File Location:{" "}
          <button
            value={this.showPropsJson}
            onClick={this.openMedia}
            style={{ background: "none", border: "none", color: "white" }}
          >
            Open{" "}
          </button>
          <button
            className="fas fa-external-link-alt"
            value={this.showPropsJson}
            onClick={this.openMedia}
          ></button>
        </div>
        <i
          onClick={this.closeBrowserMedia}
          className="far fa-times-circle fa-2x closeCircle"
        ></i>
      </div>
      <img src={this.showProps.Img} alt="" className="seasonsPreviewImg" />

      <div className="episodesJsxRoot">{this.seasonsJsx}</div>
    </div>
  );
  // Render Season(s) In Component: Show In Browser
  this.setState((prevState) => ({
    showInBrowser: !prevState.showInBrowser,
    showInBrowserObject: this.seasonPreview,
    scrollHidden: true,
  }));
  scrollToTop();
}

async function setShowMetaData(show) {
  let title = show[0].data[0].Title;
  let showDate = show[0].data[0].Year;
  let rated = show[0].data[0].Rated;
  let released = show[0].data[0].Released;
  let length = show[0].data[0].Length;
  let genre = show[0].data[0].Categories;
  let creator = show[0].data[0].Creator;
  let writers = show[0].data[0].Writers;
  let actors = show[0].data[0].Actors;
  let description = show[0].data[0].Description;
  let language = show[0].data[0].Language;
  let country = show[0].data[0].Country;
  let awards = show[0].data[0].Awards;
  let imdbRating = show[0].data[0].imdbRating;
  let metaScoreRating = show[0].data[0].Metascore;
  let metaData = {
    title,
    showDate,
    rated,
    released,
    length,
    genre,
    creator,
    writers,
    actors,
    description,
    language,
    country,
    awards,
    imdbRating,
    metaScoreRating,
  };
  return metaData;
}
//// End Media Type TV Shows

export { getSeason };
