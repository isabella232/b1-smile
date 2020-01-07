// AWS SDK starts
AWS.config.region = "eu-west-1";
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  //Your AWS Cognito Identity Pool ID goes here
  IdentityPoolId: "eu-west-1:9b4b4f04-1858-4f37-8ae0-2617545dd824"
  // IdentityPoolId: "b1d0900a-7570-4215-b067-8d832101575e"
});
var rekognition = new AWS.Rekognition();

window.addEventListener("load", function() {
  var player = document.getElementById("player");
  var snapshotCanvas = document.getElementById("snapshot");
  var captureButton = document.getElementById("capture");
  var videoTracks;
  var faceAnalysis;
  var takeSelfieEnabled = true;
  var context = snapshot.getContext("2d");
  var finalRating = 0;
  var cfserver = "http://localhost:30000";
  // var cfserver =  "https://smiletcm-happy-buffalo.cfapps.eu10.hana.ondemand.com";
  // var cfserver =  "https://smiletcm-grumpy-toucan.cfapps.eu10.hana.ondemand.com";

  var sessionID = document.getElementById("sessId").value;

  // Dialog for the survey
  dialog2 = $("#dialog-form2").dialog({
    autoOpen: false,
    closeOnEscape: false,
    height: "auto",
    width: player.clientWidth / 2,
    modal: true,
    buttons: {
      "Yes, submit!": function() {
        fillQualtrics();
        surveyFilled = true;
        dialog2.dialog("close");
      },
      "No, retake!": function() {
        location.reload();
      }
    },
    close: function() {
      if (!surveyFilled) {
        fillQualtrics();
        surveyFilled = true;
      }
    }
  });

  $("#snapshot").hide();
  var handleSuccess = function(stream) {
    // Attach the video stream to the video element and autoplay.
    player.srcObject = stream;
    videoTracks = stream.getVideoTracks();
  };

  var imagefromcam = new Image();
  captureButton.addEventListener("click", function(e) {
    // Check if camera shutter is enabled
    if (!takeSelfieEnabled) {
      e.preventDefault();
      e.stopPropagation();
      return; // TODO: VALIDAR SE ISSO EH PRECISO
    } else {
      // Check whether this is the first take or not
      // If it's a retake, restart camera streaming and hide previous snapshot
      if (document.getElementById("capture").value == "Retake") {
        takeSelfieEnabled = false; // Disables camera shutter clicks while processing
        location.reload();
        return; // TODO: VALIDAR SE ISSO EH PRECISO
      }
    }

    snapshot.width = player.clientWidth;
    snapshot.height = player.clientHeight;
    context = snapshot.getContext("2d");

    //Flip vertically to get the mirrored picture
    context.translate(snapshot.width, 0);
    context.scale(-1, 1);

    //Draw the pure selfie picture to the screen
    context.drawImage(
      player,
      0,
      0,
      snapshotCanvas.width,
      snapshotCanvas.height
    );

    // Stop all video streams.
    videoTracks.forEach(function(track) {
      track.stop();
    });

    imagefromcam.id = "pic";
    imagefromcam.src = snapshotCanvas.toDataURL("image/jpeg", 0.1);
    imgStrBase64 = imagefromcam.src.replace(
      /^data:image\/(png|jpeg);base64,/,
      ""
    );
    document.getElementById("snapshot").appendChild(imagefromcam);

    $("#player").hide();
    $("#snapshot").fadeIn();

    ProcessImage2();

    takeSelfieEnabled = false; // Disables camera shutter clicks while processing
    $("#capture").attr("src", "../static/resources/pic_preparing.png");
  });

  navigator.mediaDevices
    .getUserMedia({
      video: true
    })
    .then(handleSuccess);

  // Create user text feedback on Qualtrics
  function fillQualtrics() {
    var QID1 = finalRating; // Rating stars from smile (1-5 stars)
    var QID2_Text = document.getElementsByName("textFeedback2")[0].value; //Text feedback from user
    var estimatedAge = Math.trunc(
      (faceAnalysis.AgeRange.Low + faceAnalysis.AgeRange.High) / 2
    );

    // Format body with rating (QID1),
    // feedback text (QID2_Text), and face analysis (face.*)
    body = {
      question1: QID1,
      question2: QID2_Text,
      sessionID: sessionID,
      beard: String(faceAnalysis.Beard.Value),
      age: estimatedAge,
      eyeglasses: String(faceAnalysis.Eyeglasses.Value),
      eyesOpen: String(faceAnalysis.EyesOpen.Value),
      gender: String(faceAnalysis.Gender.Value),
      mouthOpen: String(faceAnalysis.MouthOpen.Value),
      mustache: String(faceAnalysis.Mustache.Value),
      smile: String(faceAnalysis.Smile.Value),
      sunglasses: String(faceAnalysis.Sunglasses.Value)
    };

    //Call server-side API to process qualtrics survey
    $.ajax({
      url: cfserver + "/fillSurvey",
      type: "POST",
      data: JSON.stringify(body),
      contentType: "application/json",
      success: function(data) {
        console.log("Succesfully posted in Qualtrics");
      },
      complete: function(jqXHR, textStatus) {
        console.log("Complete");
        alert(
          "Your response has been saved! \n Thanks for your participation!"
        );
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("Error: " + JSON.stringify(jqXHR.responseJSON));
      }
    });
  }

  function refreshCanvas(iBufferImage) {
    var newBuffer = new Uint8Array(iBufferImage);
    var blob = new Blob([newBuffer], { type: "image/png" });
    var url = URL.createObjectURL(blob);
    var img = new Image();

    img.onload = function() {
      context = snapshot.getContext("2d");
      //Flip vertically to get the mirrored picture
      context.translate(snapshot.width, 0);
      context.scale(-1, 1);
      context.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  //merge selfie with stars and session description
  function mergeImages(starsPath) {
    var bodyTest = {
      path: starsPath,
      session: sessionID,
      image: imgStrBase64
    };

    //Call server-side function to merge selfie with event stickers and upload to S3
    $.ajax({
      url: cfserver + "/mergeImagesAndUpload",
      type: "POST",
      data: JSON.stringify(bodyTest),
      contentType: "application/json",
      success: function(data) {
        console.log("Successfully merged and uploaded: " + data);
        refreshCanvas(data.imageBuffer.data);
        takeSelfieEnabled = false; // Disables camera shutter clicks while processing
        $("#capture").val("Retake");
        // $("#capture").attr("src", "../static/resources/pic_preparing.png");
        document.getElementById("piclink").setAttribute("href", data.imageUrl);

        // $("#capture").val("Download");
        $("#capture").attr("src", "../static/resources/pic_ready.png");
        $("#capture").css("visibility", "visible");
      },
      complete: function(data) {
        console.log("Complete");
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("Error: " + JSON.stringify(jqXHR.responseJSON));
      }
    });
  }

  //Calls DetectFaces API and shows estimated ages of detected faces
  function DetectFaces(imageData, callback) {
    var params = {
      Image: {
        Bytes: imageData
      },
      Attributes: ["ALL"]
    };

    rekognition.detectFaces(params, function(err, data) {
      if (err) console.log("Error: " + err, err.stack);
      else {
        if (!data.FaceDetails.length) {
          location.reload();
        } else {
          // retrieve the higher graded emotion for each face
          // for (var i = 0; i < data.FaceDetails.length; i++) {
            var i = 0;
            console.log("Faces: "+data.FaceDetails.length);
            var arr = data.FaceDetails[i].Emotions;
            function getMax(arr, prop) {
              var max;
              for (var k = 0; k < arr.length; k++) {
                if (max == null || parseInt(arr[k][prop]) > parseInt(max[prop]))
                  max = arr[k];
              }
              return max;
            }
            var maxConf = getMax(arr, "Confidence");
            console.log(maxConf.Type + " - " + maxConf.Confidence); //E.g.: "Happy - 0.874302"
            faceAnalysis = data.FaceDetails[i];
          // }

          var starsPath = "../static/resources/star0.png"; // starts with no stars
          switch (maxConf.Type) {
            case "ANGRY":
              finalRating = 1;
              starsPath = "../static/resources/star1.png"; // starts with no stars
              break;
            case "DISGUSTED":
              finalRating = 1;
              starsPath = "../static/resources/star1.png"; // starts with no stars
              break;
            case "FEAR":
              finalRating = 2;
              starsPath = "../static/resources/star2.png"; // starts with no stars
              break;
            case "SAD":
              finalRating = 2;
              starsPath = "../static/resources/star2.png"; // starts with no stars
              break;
            case "CONFUSED":
              finalRating = 3;
              starsPath = "../static/resources/star3.png"; // starts with no stars
              break;
            case "CALM":
              finalRating = 4;
              starsPath = "../static/resources/star4.png"; // starts with no stars
              break;
            case "SURPRISED":
              finalRating = 5;
              starsPath = "../static/resources/star5.png"; // starts with no stars
              break;
            case "HAPPY":
              finalRating = 5;
              starsPath = "../static/resources/star5.png"; // starts with no stars
          }
          //E.g.: "Final Estimated Rating for face number 1: 5 stars"
          console.log(
            "Final Estimated Rating for face number " +
              i +
              ":  " +
              finalRating +
              " stars"
          );

          document.getElementById("faceresulttext").innerHTML =
            "You look " +
            maxConf.Type.toLowerCase() +
            ". <br> Rating: " +
            finalRating +
            " star(s)" +
            "<br>" +
            "<br> Please share any additional comment:";
          dialog2.dialog("open");

          //merge selfie with stars
          mergeImages(starsPath);
        }
      }
    });
  }

  //Loads selected image and unencodes image bytes for Rekognition DetectFaces API
  function ProcessImage2() {
    image = atob(imgStrBase64);
    //unencode image bytes for Rekognition DetectFaces API
    var length = image.length;
    imageBytes = new ArrayBuffer(length);
    var ua = new Uint8Array(imageBytes);
    for (var i = 0; i < length; i++) {
      ua[i] = image.charCodeAt(i);
    }
    //Call Rekognition
    DetectFaces(imageBytes);
  }
});
