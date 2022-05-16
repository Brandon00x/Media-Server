echo "Starting Media Server"
echo "Must Run As Admin to Start MongoDB"
echo "Starting MongoDB"
net start mongodb
echo "Installing NPM Packages"
start /B npm i
cd "./server"
start /B npm i 
cd .. 

echo "Starting Server"
start /B node "./server/app.js"

echo "Starting Client"
start /B npm start