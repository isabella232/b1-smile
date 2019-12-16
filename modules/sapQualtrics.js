/* Qualtrics module to create responses into a Qualtrics Survey */
/* Qualtrics Tenant Configuration, User Credentials and Survey parameters set in environment variables */

/** Environment Variables Required:
 *
 * QUALTRICS_TENANT
 * QUALTRICS_SURVEYID
 * QUALTRICS_TOKEN
 *
 * */

var req = require("request"); // HTTP Client

module.exports = {
  FillSurvey: function(surveyData, response) {
    return FillSurvey(surveyData, response);
  }
};

function FillSurvey(surveyData, callback) {
  var uri =
    "https://" +
    process.env.QUALTRICS_TENANT +
    ".qualtrics.com/API/v3/surveys/" +
    process.env.QUALTRICS_SURVEYID +
    "/responses"; //Use your tenant and survey ID here
  console.log("Qualtrics Tenant: " + uri);
  var resp = {};
  var currDate = new Date().toJSON();
  console.log(surveyData.sessionID);
  var data = {
    values: {
      startDate: currDate,
      endDate: currDate,
      status: 0,
      ipAddress: "127.0.0.1",
      progress: 100,
      duration: 1,
      finished: 1,
      recordedDate: currDate,
      locationLatitude: "49.3008",
      locationLongitude: "8.6442",
      distributionChannel: "anonymous",
      userLanguage: "EN",
      SessID_CEDsfzz517: surveyData.sessionID,
      QID1: surveyData.question1,
      QID2_TEXT: surveyData.question2,
      Age_CEDb5o16yv: [String(surveyData.age)],
      Gender_CEDe6y27pr: [surveyData.gender],
      Eyegla_CEDaw1xl6v: [surveyData.eyeglasses],
      EyesOp_CEDydss6ci: [surveyData.eyesOpen],
      MouthO_CED416bken: [surveyData.mouthOpen],
      Mustac_CEDaihnqnh: [surveyData.mustache],
      Smile_CEDparq0sd: [surveyData.smile],
      Sungla_CED096o3r3: [surveyData.sunglasses],
      Beard_CEDe86dpz9: [surveyData.beard]
    }
  };

  //Set HTTP Request Options
  var options = {
    uri: uri,
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "X-API-TOKEN": process.env.QUALTRICS_TOKEN
    }
  };

  //Make Request
  console.log("Filling Survey in Qualtrics " + uri);
  req.post(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var obj = JSON.parse(body);
      resp = obj.result.responseId;
      console.log("Succesfully posted to Qualtrics. Response ID: " + resp);
      callback(null, resp);
    } else {
      callback(response.statusMessage, response);
    }
  });
}
