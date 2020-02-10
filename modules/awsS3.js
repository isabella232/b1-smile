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

AWS.config.update({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
  region: REGION
});

var s3 = new AWS.S3();

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function DeleteImage(imageToDelete, callback) {
  var params = { Bucket: BUCKET, Key: imageToDelete };

  s3.deleteObject(params, function(err, data) {
    if (!err) console.log("Image deleted from S3: " + data);
    else console.log(err, err.stack);
    response = data;
    callback(null, response);
  });
}

function UploadImageBuffer(buf, callback) {
  console.log("Creating buffer from base64...");
  newBuffer = new Buffer.from(buf);

  var imageRemoteName = uuidv4() + ".png";
  console.log("Picture NAME WITH GUID: " + imageRemoteName);

  console.log("Uploading selfie merged with image-from-path to S3");
  timeNow = Date.now();
  s3.putObject({
    Bucket: BUCKET,
    Body: newBuffer,
    Key: imageRemoteName,
    ACL: "public-read",
    ContentType: "image/png"
  })
    .promise()
    .then(response => {
      console.log("Total time to upload (ms): " + (Date.now() - timeNow));
      response = `${s3.getSignedUrl("getObject", {
        Bucket: BUCKET,
        Key: imageRemoteName
      })}`;
      console.log("Finished Uploading file - The URL is: " + response);
      callback(null, response);
    })
    .catch(err => {
      console.log("failed:", err);
    });
}

function UploadImage(userImage, callback) {
  console.log("Creating buffer from base64...");
  buf = new Buffer(userImage, "base64");

  var imageRemoteName = uuidv4() + ".png";
  console.log("Picture NAME WITH GUID: " + imageRemoteName);

  console.log("Uploading selfie with frame to S3");
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
