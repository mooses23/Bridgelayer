file-inventory.json

cd /Users/avimoseson/Downloads/FirmSyncLegal-1-4
node file-inventory.js
if [ $? -ne 0 ]; then
  echo "Error: file-inventory.js execution failed."
  exit 1
fi
