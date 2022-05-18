import axios from "axios";

// Display Book in Browser
async function readInBrowser(e) {
  try {
    this.bookObject = JSON.parse(e.target.value);
    this.path = this.bookObject.Path;
    this.ext = this.bookObject.Ext;
    this.name = e.target.name;
    console.info(
      `Read In Browser Called. Title: ${this.name}. Extension Type ${this.ext}`
    );
    let res = await axios.get(`/book/`, {
      params: { path: this.path, ext: this.ext },
    });

    // If Server Returned Error Alert Error.
    if (res.data.Error) {
      alert(
        `Unable to open book. A mapped drive may be disconnect. Please confirm the path exists: ${this.path}`
      );
      return;
    }

    // Render Extension Epub
    if (this.ext === ".epub") {
      this.book = res.data;
      let html = { __html: this.book };
      this.bookReader = (
        <div>
          <h1 className="showInBrowserTitle">{this.name}</h1>
          <i
            onClick={this.closeBrowserMedia}
            className="far fa-times-circle fa-2x closeCircle"
          ></i>
          <div className="showInBrowserBook" dangerouslySetInnerHTML={html} />
        </div>
      );
      this.setState((prevState) => ({
        showInBrowser: !prevState.showInBrowser,
        showInBrowserObject: this.bookReader,
        scrollHidden: true,
      }));
      this.scrollToTop();
    }
    // Render Extension PDF
    else if (this.ext === ".pdf") {
      if (res.data.Success) {
        let pdf = await require("./PDFs/ViewPDF.pdf");
        let bookReader = (
          <div>
            <h1 className="showInBrowserTitle">{this.name}</h1>
            <i
              onClick={this.closeBrowserMedia}
              className="far fa-times-circle fa-2x closeCircle"
              style={{ position: "absolute", left: "78%" }}
            ></i>
            <iframe title={this.name} className="showInBrowserPDF" src={pdf} />
          </div>
        );
        this.setState((prevState) => ({
          showInBrowser: !prevState.showInBrowser,
          showInBrowserObject: bookReader,
          scrollHidden: true,
        }));
        this.scrollToTop();
      }
    }
    // Render Extension DOC
    // TODO: DOC Files are not supported as of now. Will Alert Error Msg before code executes.
    else if (this.ext === ".doc") {
      let bookReader = (
        <div>
          <h1 className="showInBrowserTitle">Doc Files Are Not Supported</h1>
          <p>
            Please use open to view the doc file. Doc files will be supported in
            a future release.
          </p>
          <i
            onClick={this.closeBrowserMedia}
            className="far fa-times-circle fa-2x closeCircle"
            style={{ position: "absolute", left: "78%" }}
          ></i>
        </div>
      );
      this.setState((prevState) => ({
        showInBrowser: !prevState.showInBrowser,
        showInBrowserObject: bookReader,
        scrollHidden: true,
      }));
      this.scrollToTop();
    }
  } catch (err) {
    console.error(err);
  }
}

export { readInBrowser };
