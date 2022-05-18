osVersion() {
  uname -s
}

startMongoDB() {
  mongod
}

getLanIpMac() {
  ipconfig getifaddr en0 | tee ip.txt
}

getLanIpLinux() {
  hostname -I | awk '{print $1}' | tee ip.txt
}

# setProxyAddressMac() {
#   sed -i '' 's/"proxy": ""/"proxy": 'http://localhost:3020'"/g' package.json
# }

# setProxyAddressLinux() {
#   sed -i 's/"proxy": ""/"proxy": "http://localhost:3020"/g' package.json
# }

# Get OS Version
if [[ osVersion="Darwin" ]]; then
  # OS MAC
  echo "Starting MongoDB"
  # Start MongoDB
  startMongoDB
  # getLanIpMac
  # setProxyAddressMac

else
  # OS Linux
  echo "Starting MongoDB"
  # Start MongoDB
  startMongoDB
  # getLanIpLinux
  # setProxyAddressLinux
fi

echo "Installing NPM Packages"
# Install NPM Packages for Client / Server
npm i
npm i "./server"
echo "Starting Server"
# Start Server
node "./server/app.js" &
echo "Opening Client"
# Start Client
npm start &
