const appId = "sample_apps-rhfdz";
const stitchClientPromise = stitch.StitchClientFactory.create(appId);

stitchClientPromise.then(stitchClient => {
  const db = stitchClient.service("mongodb", "mongodb-atlas").db("HR");

  stitchClient
    .login("dafu@bufudlur.et", "sekritpwd")
    .then(() => stitchClient.executeFunction("createOrgChart"))
    .then(result => {
      const html = generateOrgChart(result);
      document.getElementById("top").innerHTML = html;
    })
    .catch(console.error);
});

function generateOrgChart(employee) {
  const directReports = employee.directReports;
  const html = `
    <ul>
      <li>${employee.name} (${employee.title}): ${employee.email}</li>
      ${directReports.map(generateOrgChart).join("")}
    </ul>
  `;
  return html;
}
