const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const cors = require('cors');
const express = require('express');
var path = require('path');

dotenv.config();

const env = process.env;
const awsKey = env.AWS_KEY;
const awsSecret = env.AWS_SECRET;
const awsRegion = env.AWS_REGION;

const creds = new AWS.Credentials({
    accessKeyId: awsKey,
    secretAccessKey: awsSecret,
})
const ivs = new AWS.IVS({
    endpoint: `https://ivs.${awsRegion}.amazonaws.com`,
    credentials: creds,
});
const port = +env.APP_PORT;
const arn = env.AWS_CHANNEL_ARN;

const app = express();
app.use(express.json());
app.use(cors());
app.options('*', cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/pages/index.html'));
});

app.get('/vjs', (req, res) => {
    res.sendFile(path.join(__dirname + '/pages/index-vjs.html'));
});

app.post('/emoji', (req, res) => {
    const body = req.body;
    if (body && Object.keys(body).length !== 0) {
        ivs.putMetadata({
            channelArn: arn,
            metadata: JSON.stringify(body),
        }, (err, data) => {
            if (err) {
                res.status(400).send({
                    data: {
                        success: false,
                        error: err.code,
                    }
                 });
            } else {
                res.status(200).send({
                    data: {
                        success: true,
                    }
                });
            }
        });
        return;
    }
    res.status(200).send({
        data: {
            success: false,
            error: 'No body provided',
        },
    });
});
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
