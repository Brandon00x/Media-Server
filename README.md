# Media Server

<p>This project was made using NodeJS for the backend and React for the front end. One goal when writing this project was writing reusable code.
My main goal for this project was to showcase my abilities writing code and obtain a developer job.</p>

<p>Feedback and feature suggestions are appreciated.</p>

<p>See the "About Me" section at the bottom for why I want a developer job and my skills/background in IT and past developer work.</p> <br/>

## Installation / Setup

<h3>Prerequisites:</h3>
<li>NodeJS - 16.14.0 <a>https://nodejs.org/en/download/</a></li>
<li>MongoDB <a>https://www.mongodb.com/try/download/community</a></li>
<br/>
<h3>Start the Program:</h3>
<p>Inside the App Directory Run:</p>

`npm i`

`npm start`

<p>Inside the App/Server Directory Run:</p>

`npm i`

`node app.js`

<br/>

## About Media Server

<p>This project was designed to include all popular media types most users have downloaded to their machines and put them in a single easily accessable location with metadata information included. From one location they would be able to view, play, read, and use all media types easily.</p>
<br/>
<h4>Media Types Supported:<h4>
<li>Books</li>
<li>Movies</li>
<li>TV Shows</li>
<li>Music</li>
<li>Photos</li>
<br/>
<h3>Metadata:</h3>
<p>This project obtains metadata from multiple API sources.</p>
<h4>The API's used are:</h4>
<li>Books: Google Books</li>
<li>Movies and TV Shows: OMDBAPI</li>
<li>Music: Apple Music</li>
<li>Photos: N/A</li>
<br/>
<h3>API Limitations:</h3>
<li>Books: None</li>
<li>Movies and TV: 1000 Calls/Day</li>
<li>Music: Personal API Key Needed $99/Year Apple Developer Program</li>
<li>Photos: N/A</li>
<br/>
<h3>Server Information:</h3>
<p>The NodeJS server scans a user defined root directory for a media type. The scan will find files based on popular file extension types for that media type.</p>
<br/>
<h3>Current Supported File Extensions, by Media Type:</h3>
<h4>Books:</h4>
<li>.epub</li>
<li>.pdf</li>
<li>.doc</li>

<h4>Movies and TV:</h4>
<li>.mp4</li>
<li>.mkv</li>
<li>.m2ts</li>

<h4>Photos:</h4>
<li>.jpg</li>
<li>.gif</li>
<li>.png</li>
<li>.tiff</li>

<h4>Music</h4>
<li>.flac</li>
<li>.mp3</li>
<li>.m4a</li>
<br/>
<h3>Client Information:</h3>
<p>The client side was built using React. From the client you can play/read/view your media. View metadata information obtained from API's listed above in easily readable cards. Sort Media Types based on Name, Year, Length, etc. Open file locally if you wish to use a different program to handle the media type. View information on items not found from scan and fix metadata so they are found on the next scan.</p> <br/>

## Preview Images

<h2>Books</h2>
<img src="./images/books.png" />
<h2>Book Reader</h2>
<img src="./images/bookreader.png" />
<h2>Music</h2>
<img src="./images/musicprev.png" />
<h2>Movies</h2>
<img src="./images/movies.png" />
<h2>Watch Movie</h2>
<img src="./images/moviestream.png" />
<h2>TV Shows</h2>
<img src="./images/tv.png" />
<h2>Photos</h2>
<img src="./images/photos.png" />
<h2>Settings</h2>
<img src="./images/settings.png" />

## Additional Features To Be Added Soon / Known Bugs

Date: 4/20/22

<h3>ALPHA Version Changes - WIP</h3>
<li>Windows Testing / Fixes</li>
<li>Add Album Goto Button for Music Player NavBar</li>
<li>Feature - Fix media items not found from browser window and retry API call for fixed item.</li>
<li>Feature - Better logging</li>
<li>Code Cleanup - Migrate Media Types into individual components. Certain functions are not reusable for all media types now. </li>

<h3>BETA Version Changes - Timeline TBD</h3>
<li>Feature - Include Extra Metadata for Books/Movies/TV/Photos</li>
<li>Create installer for prereqs / setup</li>
<li>Performance - API Calls Performance Improvements.</li>
<li>Performance - Scan Performance Improvements Based on Data Captured</li>
<li>Can change to BETA version after above is done.</li>
<li>Feature - More Sort Options for Album Title / Other properties.</li>
<li>Feature - Fix Incorrect Media Data Match</li>
<li>Feature - Add Queue for TV/Movies</li>
<li> Feature - Add Played Status / Play Count </li>
<li>Feature - Resume Playback</li>
<li>Feature - Recently Added</li>
<li>Feature - Redesign Home Screen</li>
<li>Feature - Add stream options from web locations.</li>
<li>Feature - Playlists</li>
<li>Feature - Different View Options</li>
<li>Feature - Custom Poster / Edit Media Information</li>
<li>Feature - Webooks<li>
<li>Feature - CSS Changes / CSS Transitions</li>

<h3>Features to be added by Media Type</h3>

<h3>Books:</h3>
<li>Bug - Fix View for PDF file extension to prevent reload</li>
<li>Feature - Add Read View for DOC file extension</li>
<li>Feature - Fix EPub Links / Chapters / Images </li>
<li>Feature - Add read by chapter </li>
<li>Feature - Save last location when closing. </li>

<h3>TV Shows:</h3>
<li>Feature - Play Single Season Episode.</li>
<li>Feature - Metadata for Single Episode.</li>
<li>Feature - Card View for Seasons/Episodes.</li>
<li>Data - Transcode to support more codecs.</li>

<h3>Movies:</h3>
<li>Data - Include Year in API call for Movies and TV to prevent incorrect matches</li>
<li>Data - Transcode to support more codecs.</li>

<h3>Photos:</h3>
<li>Performance - Speed up photos </li>
<li>Data - Add File Size.</li>
<li>Data - Add more info under description.</li>
<li>Fix Sort for Photos</li>
<br/>

## Change Log | Features Added / Fixed Bugs
<li>Finished 5/14 - Bug Fixes - Fix scroll to top error triggered by createRows refresh.</li>
<li>Finished 5/14 - Bug Fixes - Prevent scroll to top / need for create rows on toggle album or artist title.</li>
<li>Finished 5/13 - Performance - Store 1 Item at a time from Final media array instead of whole array.</li>
<li>Finish 5/13 - Included more metadata from API calls to use later.</li>
<li>Finished 5/12 Add error message for folder paths not available.</li>
<li>Finished 5/11 - Bug Fixes - Sort: Misc sort issues caused by special characters / other issues.</li>
<li>Finished 5/11 - Add Pin feature for all media types.</li>
<li>Finished 5/11 - Fix crash on media path not available due to drive disconnect or change of location.</li>
<li>Finished 5/11 - Fix double click on minimize card.</li>
<li>Finished 5/11 - Fixed Sort Issues</li>
<li>Finished 5/11 - Alt Image Not Found PNG</li>
<li> Finished 5/11 Design - Better Design and CSS Improvements</li>
<li>Finished 5/10 - Added Display Props to database for default settings.</li>
<li>Finished 5/10 - Fix Music Volume Slider</li>
<li>Finished 5/10 Feature - Handle Server Address for Client. Prevent VPN Lan as Double IP Address </li>
<li>Finished 5/9 - Add Minimize/Close for Card popout.</li>
<li>Finished 5/8 Feature - Search.</li>
<li>Finished 5/8 Feature - Moveable Album Tiles / Multiple Album Description Cards.</li>
<li>Finished 5/8 Add Scroll Bar</li>
<li>Finished 5/4 Performance  - Modify CreateRows Function.</li>
<li>Finished 5/2 Performance - Include All Media Types in DB.</li>
<li>Finished 5/1 Data - Section for Media Not Found API Call</li>
<li>Finished 4/30 Performance - Add Database MongoDB or MS SQL Server</li>
<li>Finished 4/30 Feature - Continuous Album Playback</li>
<li>Finished 4/29 Feature - Media Player in Browser</li>
<li>Finished 4/29 Data - Include Artist in Apple Music API Call to prevent incorrect matches</li>
<li>Finished 4/29 Data/Performance - Card Based on Album w/ Songs (Currently 1 Song/Card. Will Decrease Load Times)</li>
<br/>

## About Me

<h3>Why do I want a developer job?</h3>

<li>Grow Skillset</li>
<li>Continuous Unique Problems to Solve</li>
<li>Learn from Others</li>
<li>Utilization of Critical Thinking / Problem Solving skills</li>
<li>More Enjoyable than Systems Administration (to me)</li>
<li>Less Interruptions from Non-Technical People while Working</li> <br/>

<h3>My Skillset / Background</h3>

<p>My current background is in Systems Administration with experience managing Amazon Web Services such as EBS, EC2, VPC, Load Balancing, Route53, and more. I also have experience managing repositories such as merging pull requets, solving merge conflicts, and testing code before deploying to production. Other areas I have experience in include, SQL: backing up databases, restoring databases, writing reports, revewing performance indicies. Networking: Configuring VLAN's, VPN's, DNS Servers, Firewalls, etc. If there is a technical problem, I can solve it. If there there is a technical skill I don't have, I can learn it. </p>
<br/>
<p>Thank you for reading, hopefully you enjoy this program! Feedback is appreciated.</p>
