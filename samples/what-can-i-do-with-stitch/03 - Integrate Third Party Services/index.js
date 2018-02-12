const appId = "sample_apps-rhfdz";
const stitchClientPromise = stitch.StitchClientFactory.create(appId);

function sendTwilioSms() {
  stitchClientPromise
    .then(stitchClient => {
      stitchClient
        .login("dafu@bufudlur.et", "sekritpwd")
        .then(() => {
          const phoneNumberEl = document.getElementById("phoneNumberInput");
          stitchClient.executeServiceFunction("twilioService", "send", {
            to: phoneNumberEl.value,
            from: "+17655885018", // This number is verified by a service rule. Changing it will prevent sending the SMS.
            body: "Hello from MongoDB Stitch!" // This body text is also guaranteed by a rule.
          });
          phoneNumberEl.value = "";
      })
    })
    .catch(e => console.error("error: ", e));
}
