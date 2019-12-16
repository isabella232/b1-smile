/* AWS S3 module to temporarily store pictures on S3 bucket, and delete them */
/* ... parameters set in environment variables */

/** Environment Variables Required:
 *
 * AWS_BUCKET           - S3 Bucket ID
 * AWS_REGION           - AWS Region
 * AWS_ACCESS_KEY       - AWS Access Key
 * AWS_SECRET_KEY       - AWS Secret Key
 *
 * */

var AWS = require("aws-sdk");

const BUCKET = process.env.AWS_BUCKET;
const REGION = process.env.AWS_REGION;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const SECRET_KEY = process.env.AWS_SECRET_KEY;

module.exports = {
  UploadImage: function(userImage, response) {
    return UploadImage(userImage, response);
  },
  UploadImageBuffer: function(userImageBuffer, response) {
    return UploadImageBuffer(userImageBuffer, response);
  },
  DeleteImage: function(userImage, response) {
    return DeleteImage(userImage, response);
  }
};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

function UploadImage(userImage, callback) {
  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION
  });

  var s3 = new AWS.S3();
  buf = new Buffer(userImage, "base64");
  console.log("Merging pictures using SHARP: selfie with SMB Summits frame");

  console.log("Uploading selfie with frame to S3");

  // var imageRemoteName = `selfie_${new Date().getTime()}.png`;
  // console.log("Picture NAME WITH TIMESTAMP: " + imageRemoteName);

  var imageRemoteName = uuidv4() + '.png';
  console.log("Picture NAME WITH GUID: " + imageRemoteName);



  s3.putObject({
    Bucket: BUCKET,
    Body: buf,
    Key: imageRemoteName,
    ACL: "public-read",
    ContentType: "image/png"
  })
    .promise()
    .then(response => {
      console.log(`done! - `, response);
      console.log(
        `The URL is ${s3.getSignedUrl("getObject", {
          Bucket: BUCKET,
          Key: imageRemoteName
        })}`
      );

      response = `${s3.getSignedUrl("getObject", {
        Bucket: BUCKET,
        Key: imageRemoteName
      })}`;
      callback(null, response);
    })
    .catch(err => {
      console.log("failed:", err);
    });
}

function DeleteImage(imageToDelete, callback) {
  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION
  });

  var s3 = new AWS.S3();
  var params = { Bucket: BUCKET, Key: imageToDelete };

  s3.deleteObject(params, function(err, data) {
    if (!err) console.log("Image deleted from S3: " + data);
    else console.log(err, err.stack);
    response = data;
    callback(null, response);
  });
}

function UploadImageBuffer(buf, callback) {
  newBuffer = new Buffer.from(buf);
  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION
  });

  var s3 = new AWS.S3();

  console.log("Uploading selfie merged with image-from-path to S3");
  
  // var imageRemoteName = `selfie_${new Date().getTime()}.png`;
  // console.log("Picture NAME WITH TIMESTAMP: " + imageRemoteName);

  var imageRemoteName = uuidv4() + '.png';
  console.log("Picture NAME WITH GUID: " + imageRemoteName);

  s3.putObject({
    Bucket: BUCKET,
    Body: newBuffer,
    Key: imageRemoteName,
    ACL: "public-read",
    ContentType: "image/png"
  })
    .promise()
    .then(response => {
      response = `${s3.getSignedUrl("getObject", {
        Bucket: BUCKET,
        Key: imageRemoteName
      })}`;
      console.log("Done - The URL is: " + response);
      callback(null, response);
    })
    .catch(err => {
      console.log("failed:", err);
    });
}
