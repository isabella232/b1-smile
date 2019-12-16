/* SHARP module to  merge two pictures: firts in base64 format and the second from local path, output is merged image in buffer format */
/* ... no parameters required */

/** Environment Variables Required:
 *
 * None
 *
 * */

const sharp = require("sharp"); // Image manipulation
const path = require("path"); // Path module

module.exports = {
  MergeImages: function(imagesData, callback) {
    return MergeImages(imagesData, callback);
  }
};

function MergeImages(imagesData, callback) {
  userImage = imagesData.image;
  imagePath = imagesData.path;
  smbImagePath = "../static/resources/smbmallorca.png";
  // sessionImagePath = "../static/resources/session1.png";
  sessionImagePath = "../static/resources/" + imagesData.session + ".png";

  buf = new Buffer(userImage, "base64");

  console.log("Merging pictures using SHARP: selfie with image from path");

  if (parseInt(imagesData.session) > 653 && parseInt(imagesData.session) < 657) {
    //meaning there's a valid session code, merge 3 images to the selfie
    sharp(buf)
      .composite([
        {
          input: path.join(__dirname, imagePath),
          gravity: "northwest"
        },
        {
          input: path.join(__dirname, sessionImagePath),
          top: 120,
          left: 15
        },
        {
          input: path.join(__dirname, smbImagePath),
          gravity: "southwest"
        }
      ])
      .toBuffer()
      .then(function(outputBuffer) {
        console.log("Pictures merged successfully, sending image buffer back");
        callback(null, outputBuffer);
      })
      .catch(err => {
        console.log("Failed merging images using SHARP: " + err);
      });
  } else {
    //meaning there's no valid session code, merge only 2 images to the selfie
    sharp(buf)
      .composite([
        {
          input: path.join(__dirname, imagePath),
          gravity: "northwest"
        },
        {
          input: path.join(__dirname, smbImagePath),
          gravity: "southwest"
        }
      ])
      .toBuffer()
      .then(function(outputBuffer) {
        console.log("Pictures merged successfully, sending image buffer back");
        callback(null, outputBuffer);
      })
      .catch(err => {
        console.log("Failed merging images using SHARP: " + err);
      });
  }
}
