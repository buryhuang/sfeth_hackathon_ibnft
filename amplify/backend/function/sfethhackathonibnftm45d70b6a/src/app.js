/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/




const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const ipfs_nft_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFiOEZCMTU2Qzk5NEJkMERkQzMxMDQ3Njc5MTZGMDVDMDFhZkQ2RUQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NDAzMjQ0NTMxOSwibmFtZSI6IkFydHNpbyJ9.FUiSZ3GXt2r_AHC8nYRLOjTrMXGhn2PRThHDxol3BO8'
const multer = require('multer')
const FormData = require('form-data')


// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 接收到檔案後輸出的儲存路徑（若不存在則需要建立）
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // 這邊可以設定檔名，如果nft圖片要1、2、3...，如此往下的流水號在這邊更改。
    // 將儲存檔名設定為 時間戳 + 檔案原始名，比如 151342376785-123.jpg
    cb(null, file.originalname);
  },
});

app.use(bodyParser.json({ limit: '200mb' }));
var upload = multer({ storage: storage });

// 上傳到ipfs
async function uploadFileToIpfs(body) {
  return fetch('https://api.nft.storage/upload', {
    body,
    headers: {
      Authorization: `Bearer ${ipfs_nft_key}`,
    },
    method: 'POST',
  })
    .then((res) => {
      return res.json();
    })
    .catch(console);
}

// // 上傳圖片的api
// app.post('/upload', upload.array('upload'), function (req, res) {
//   const body = new FormData();
//
//   //組合data的body
//   for (var i = 0; i < req.files.length; i++) {
//     body.append('file', fs.createReadStream(req.files[i].path));
//   }
//   uploadFileToIpfs(body)
//     .then(function (value) {
//       console.log(value);
//       res.send({
//         ok: true,
//         cid: value.value.cid,
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.send({
//         ok: false,
//       });
//     });
// });

app.post('/upload_single', function (req, res) {
  console.log(req);
  if (req.files.length !== 1) res.send({ ok: false });
  uploadFileToIpfs(fs.createReadStream(req.files[0].path))
    .then(function (value) {
      console.log(value);git --version
      res.send({
        ok: true,
        cid: value.value.cid,
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        ok: false,
      });
    });
});

/**********************
 * Example get method *
 **********************/

app.get('/', function(req, res) {
  // Add your code here
  console.log("/ called")
  res.json({success: 'get call succeed! from root', url: req.url});
});

app.get('//*', function(req, res) {
  // Add your code here
  console.log('other called');
  res.json({success: 'get call succeed! from child', url: req.url});
});

/****************************
* Example post method *
****************************/

app.post('/', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('//*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example put method *
****************************/

app.put('/', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('//*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
