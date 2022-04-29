const EPub = require("epub");
const fs = require("fs");

function readBook(path, ext, res) {
  try {
    // Extension is Epub
    if (ext === ".epub") {
      let epub = new EPub(path);
      let bookText;
      let count = 0;
      epub.on("end", function () {
        console.info(
          `Parsing Epub File: ${epub.metadata.title}. Chapter Count: ${epub.flow.length}`
        );
        // Loop Over Every Epub Chapter:
        epub.flow.forEach(function (chapter) {
          // Append Chapter Text/Images/Values to bookText
          epub.getChapter(chapter.id, function (err, text) {
            count++;
            bookText += text;
            // If Counter is Equal to Book's Chapter Count we are done looping. Send Book Contents.
            if (count === epub.flow.length) {
              console.info(
                `Finished Parsing Epub: ${epub.metadata.title}.\nStats: Chapter Count: ${epub.flow.length} BookText Length: ${bookText.length}\n`
              );
              // Send Book Contents.
              res.send(bookText.slice(9));
            } else if (err) {
              res.send({ Error: `Unable to parse epub file: ${err}` });
              console.error(`Error Parsing Epub File ${err}`);
            }
          });
        });
      });
      // Epub must be parsed before it can be used.
      epub.parse();
    }
    // Extension is PDF
    else if (ext === ".pdf") {
      try {
        fs.copyFile(
          path,
          "../../mediaserver/app/src/PDFs/ViewPDF.pdf",
          (err) => {
            if (err) {
              console.error("Error copying PDF: ", err);
            } else {
              console.info("Successfully Copied PDF to SRC Directory.");
              res.send({ Success: "PDF Ready to view" });
            }
          }
        );
      } catch (err) {
        res.send({ Error: `Unable to load PDF.` });
        console.error(`Unable to load PDF: ${err}`);
      }
    }
    // Extension is DOC
    else if (ext === ".doc") {
      res.send({ Error: `Files with Extension ".doc" are not yet supported` });
    }
  } catch (err) {
    console.error(`Error Parsing Book: ${err}\nBook Path ${path}`);
    res.send({ Error: `Error Parsing Book: ${err}\nBook Path ${path}` });
  }
}

module.exports = { readBook };
