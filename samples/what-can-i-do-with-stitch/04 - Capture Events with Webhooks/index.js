const appId = "sample_apps-rhfdz";
const stitchClientPromise = stitch.StitchClientFactory.create(appId);

stitchClientPromise.then(stitchClient => {
  const db = stitchClient.service("mongodb", "mongodb-atlas").db("StitchDocs");

  stitchClient
    .login("dafu@bufudlur.et", "sekritpwd")
    .then(() => getLatestRepoLogs(db))
    .catch(console.error);
});

function getLatestRepoLogs(db) {
  db.collection("repologs")
    .find({})
    .sort({ timestamp: -1 })
    .execute()
    .then(docs => {
      let html = docs
        .map(
          doc => `
            <tr>
              <td>${doc.timestamp}</td>
              <td>
                <a href="${doc.payload.sender.html_url}" target="_blank">
                  <img src="${doc.payload.sender.avatar_url}" width="32">&nbsp;${
                doc.payload.sender.login
              }
                </a>
              </td>
              <td>${mapKeysToType(doc)}</td>
            </tr>
          `
        )
        .join("");
      document.getElementById("logs").innerHTML = html;
    });
}

function mapKeysToType(doc) {
  const mapping = githubKeyMapping();
  var keySig = Object.keys(doc.payload)
    .sort()
    .join("-");
  console.log(keySig);
  return mapping[keySig] ? mapping[keySig] : "Other Event";
}

// Returns a helpful mapping of github payload keys to their event
function githubKeyMapping() {
  return {
    "action-comment-organization-repository-sender": "Commit Comment Event",
    "description-master_branch-organization-pusher_type-ref-ref_type-repository-sender":
      "Create Event",
    "pusher_type-ref-ref_type-repository-sender": "Delete Event",
    "deployment-repository-sender": "Deployment Event",
    "deployment-deployment_status-repository-sender": "Deployment Status Event",
    "forkee-repository-sender": "Fork Event",
    "pages-repository-sender": "Gollum Event",
    "action-comment-issue-repository-sender": "Issue Comment Event",
    "action-issue-repository-sender": "Issues Event",
    "action-member-repository-sender": "Member Event",
    "action-member-organization-scope-sender-team": "Membership Event",

    "action-comment-issue-organization-repository-sender": "Issue Comment Event",
    "action-issue-organization-repository-sender": "Issue Event",

    "build-id-repository-sender": "Page Build Event",
    "repository-sender": "Public Event",
    "action-number-organization-pull_request-repository-sender":
      "Pull Request Event",
    "after-base_ref-before-commits-compare-created-deleted-forced-head_commit-organization-pusher-ref-repository-sender":
      "Push Event",
    "action-release-repository-sender": "Release Event",
    "action-organization-repository-sender": "Repository Event",
    "branches-commit-context-created_at-description-id-name-repository-sender-sha-state-target_url-updated_at":
      "Status Event",
    "organization-repository-sender-team": "Team Add Event",
    "action-repository-sender": "Watch Event"
  };
}
