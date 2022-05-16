osVersion() {
    uname -s
}

startMongoDB(){
  mongod
}

if [[ osVersion="Darwin" ]]
then
  echo "Starting MongoDB"
  startMongoDB
else 
  echo "Starting MongoDB"
  startMongoDB
fi 
echo "Installing NPM Packages"
npm i
npm i "./server"
echo "Starting Server"
node "./server/app.js" &
echo "Opening Client"
npm start &
