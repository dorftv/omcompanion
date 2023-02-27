const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

let config;

const loadConfig = () => {
  try {
    const fileContents = fs.readFileSync('config/config.yml', 'utf8');
    const parsedConfig = yaml.load(fileContents);
    config = parsedConfig;
  } catch (error) {
    console.error('Error loading config file:', error);
  }
};

const startFileWatcher = () => {
  fs.watchFile('config/config.yml', { interval: 500 }, (curr, prev) => {
    if (curr.mtime > prev.mtime) {
      console.log('Reloading config file');
      loadConfig();
    }
  });
};

loadConfig();
startFileWatcher();


app.post('/admission', async (req, res) => {
  const admission = req.body;
  const urlParts = admission.request.url.split('/');
  const app = urlParts[3];
  const stream = urlParts[4];

  let response;
  if (process.env.OM_COMPANION_RESUBMIT_URL) {
    axios.post(process.env.OM_COMPANION_RESUBMIT_URL, admission)
      .then(response => {
        res.send(response.data);
      })
      .catch(error => {
        console.error('Error resubmitting request:', error);
        res.status(500).send('Error resubmitting request');
      });
  } else {
    res.json({
      allowed: true,
      lifetime: 0,
      reason: 'authorized'
    });
    
  }
  

  if (admission.request.direction === 'incoming') {

    const matchedRecord = config.record.find(record => {
        const appMatch = record.app === '*' || record.app === app;
        const streamMatch = record.stream === '*' || record.stream === stream;
        return appMatch && streamMatch;
      });

    if (matchedRecord) {
      if (admission.request.status === 'opening') {
        try {
          const passwordBase64 = btoa(process.env.OM_COMPANION_API_PASSWORD);
          const authHeader = `Basic ${passwordBase64}`;
          const response = await axios.post(`${process.env.OM_COMPANION_API_HOSTNAME}/v1/vhosts/default/apps/${app}:startRecord`, {
            id: stream,
            stream: {
              name: `${stream}`,
            },
           // filePath : "/recordings/file.ts",
           // infoPath : "/recordings/file.xml",
            interval : 3600000,
            segmentationRule : "continuity"
        
          }, {
            headers: {
              Authorization: authHeader
            }
          });
          console.log(`Created Recording for ${stream}`)
          //console.log(response.data);
        } catch (error) {
          console.error(error);
        }
      } else if (admission.request.status === 'closing') {
        try {
          const passwordBase64 = btoa(process.env.OM_COMPANION_API_PASSWORD);
          const authHeader = `Basic ${passwordBase64}`;
          const response = await axios.post(`${process.env.OM_COMPANION_API_HOSTNAME}/v1/vhosts/default/apps/${app}:stopRecord`, {
            id: stream
          }, {
            headers: {
              Authorization: authHeader
            }
          });
          console.log(`Stopped Recording for ${stream}`)
          //console.log(response.data);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
