const appId = "sample_apps-rhfdz";
const stitchClientPromise = stitch.StitchClientFactory.create(appId);

stitchClientPromise.then(stitchClient => {
  stitchClient
    .login("dafu@bufudlur.et", "sekritpwd")
    .then(() => stitchClient.service("mongodb", "mongodb-atlas").db("HR"))
    .then(db =>
      db
        .collection("employees")
        .find()
        .execute()
    )
    .then(employees => displayEmployees(employees));
});

// Display employee data in the table
function displayEmployees(employees) {
  const html = employees
    .map(
      employee => `
        <tr>
          <td>${employee.name.last}, ${employee.name.first}</td>
          <td>${employee.email}</td>
          <td>${employee.role} - ${employee.level}</td>
          <td>${employee.manager}</td>
          <td>${employee.salary}</td>
        </tr>
      `
    )
    .join("");
  document.getElementById("employees").innerHTML = html;
}
