# Integrate Amazon SES

Amazon Simple Email Service (SES) is an email service provided by Amazon as part
of their AWS cloud platform. SES makes it straightforward to send transactional,
marketing, and other types of email quickly and programmatically. In this
walkthrough, we'll demonstrate how to integrate Amazon SES into a web
application using the MongoDB Stitch SES service module.

## Prerequisites
- Stitch App
- AWS Account

## Preview

This walkthrough will focus on integrating the MongoDB Stitch SES Service into a
simple html form. Once we've integrated SES into the web app, users will be able
to authenticate to MongoDB Stitch and enter their email address to receive a
friendly message. We'll use the following HTML as a base:

```html
<div>Include base HTML here</div>
```

You may notice references to several as of yet undefined functions in the base
HTML. We'll define these functions later in this walkthrough.

## Procedure

### 1 - Set Up SES

#### Verify Sender Address

You must verify ownership of an email address before you can use it to send
email with SES.

1. Navigate to the [SES Management Console](https://console.aws.amazon.com/) and
   sign in to your AWS account.
2. In the left navigation, click **Email Addresses** under the **Identity
   Management** section.
3. On the **Email Addresses** page, click the **Verify a New Email Address**
   button.
4. Enter the email address you wish to  send email from.
5. Follow the link in the confirmation email sent to the address you entered.

You should now have an email address that can be used to send email with SES.

> **Note**
>
> If you have not requested an increased send limit, Amazon SES will be in
> sandbox mode. While in sandbox mode your email throughput is limited and you
> must verify both addresses you wish to send email to as well as addresses you
> want to send from.

#### Set Up IAM Credentials

SES can tap into the powerful suite of identity and access management tools
provided by AWS. For production deployments you should follow best practices by
creating IAM groups, policies and users and using credentials generated for
these instead of your root `Access Key ID` and `Secret Access Key`.

##### Create SES Policy

1. Navigate to the [IAM Console](https://console.aws.amazon.com/iam/home#/home).
2. In the left navigation, click **Policies**.
3. On the **Policies** page, click the **Create Policy** button.
4. Configure the new policy with the following settings:
    - **Service:** `SES`
    - **Actions:** Check `SendEmail` within `Write`
5. Click the **Review Policy** button and give the policy a name and
   description.
    - **Name:** `SES_SendOnly`
    - **Description:** Allows a user to send emails.
6. Click the **Create Policy** button.

##### Create User

1. Navigate to the [IAM Console](https://console.aws.amazon.com/iam/home#/home).
2. In the left navigation, click **Users**.
3. On the **Users** page, click the **Add User** button.
4. Enter a User name of your choice.
    - For this tutorial we'll name the user **StitchUser**.
5. Enable **Programmatic Access** under **Access Type**.
6. Click the **Next: Permissions** button.
7. On the **Permissions** page, select **Attach existing policies directly**
8. Search for and select the `SES_SendOnly` policy we just created.
9. Click the **Next: Review** and ensure that the new user was set up correctly.
10. Click **Create User**

You should now have a new user named **StitchUser**. Copy the `Access Key ID`
and `Secret Access Key` for this user. You will need them to connect MongoDB
Stitch to SES.

### 2 - Set Up MongoDB Stitch

#### Define Values

Before setting up the MongoDB Stitch SES Service, add the email address you
verified with SES as a **Value**. While not strictly necessary, this will allow
you to change to a different email address in the future without needing to edit
any functions.

1. Navigate to the main console of your Stitch app.
2. In the left navigation, click **Values** under the **Control** section.
3. On the **Values** page, click the **New Value** button.
4. Name the new value **senderEmail**.
5. Enter your verified email address in the editor as a string, and click **Save**.

You can now access your verified email address from any Stitch function.

#### Create Valid Email Test Function

We should test user input to ensure that what our app is receiving is what we
think it is. For this app, users will enter their email address so we should
test to make sure we reject any invalid inputs.

1. Navigate to the main console of your Stitch app.
2. In the left navigation, click **Functions** under the **Control** section.
3. On the **Functions** page, click the **Create New Function** button.
4. Name the new function **isValidEmail** then click the **Function Editor** tab.
5. Copy the following function into the editor:

```javascript
exports = function(candidate){
  // There is no perfect email regex: https://www.regular-expressions.info/email.html
  var isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  return isEmail.test(candidate);
};
```
6. Click the **Save** button in the top left corner of the function editor.

This function uses a regular expression to test if a candidate string is a valid
email address.

#### Configure the SES Service

Once you have verified your sender email address and acquired an `Access Key ID`
and `Secret Access Key`, you are ready to connect to SES through MongoDB Stitch.

1. Navigate to the main console of your Stitch app.
2. In the left navigation, click **Services** under the **Control** section.
3. On the **Services** page, click the **Add a Service** button.
4. Select the **SES** service and fill in the configuration details.
    - **Service Name:** `ses`
    - **Region:** `us-east-1`
    - **Access Key ID:** The Access Key ID you acquired when setting up SES.
    - **Secret Access Key:** The Secret Access Key you acquired when setting up
      SES.
5. After creating the new SES service, navigate to the **Rules** tab and click
   the **New Rule** button. Name the rule whatever you'd like.
6. After you've created a new rule, toggle **send** on in the **Actions**
   section.
7. Add the following filter document in the **When** section:

```javascript
{
    "%%args.fromAddress": "%%values.senderEmail",
    "%%true": {
        "%function": {
            "name": "isValidEmail",
            "arguments": [
                "%%args.toAddress"
            ]
        }
    }
}
```

This rule will prevent any emails being sent through SES unless the
**fromAddress** field is the same as the verified sender address we saved as a
value and the **toAddress** field is successfully verified as a valid email by
the **isValidEmail** function we created earlier.

#### Create `sendEmail` Function

#### `sendEmail`

Follow the same process we used earlier to create the **isValidEmail** function
to create a new function called **sendEmail**. Copy the following code into the
function editor:

```javascript
exports = function(email){
  var ses = context.services.get('ses');
  
  ses.send({
    "toAddress": email,
    "body": "Hello from MongoDB Stitch!",
    "fromAddress": context.values.get('senderEmail'),
    "subject": "MongoDB Stitch SES Integration"
  });
};
```

### 4 - Web App Javascript

Add the following code to the `<script>` tag at the bottom of the base HTML's
`<body>` tag:

#### Create a New `StitchClient` Instance

```javascript
const stitchClient = new stitch.StitchClient('sampleone-mriot');
```

#### `displayLoggedInState`

```javascript
function displayLoggedInState() {
    if (stitchClient.authedId()) {
        $('#ses_form').show();
        $('#loginButton').hide();
        $('#logoutButton').show();
    }
}
```

#### `displayLoggedOutState`

```javascript
function displayLoggedOutState() {
    if (!stitchClient.authedId()) {
        $('#ses_form').hide();
        $('#loginButton').show();
        $('#logoutButton').hide();
    } else {
        displayLoggedInState()
    }
}
```

#### `login`

```javascript
function login() {
    if (!stitchClient.authedId()) {
        stitchClient.login()
            .then(() => console.log('logged in as: ' + stitchClient.authedId()))
            .then(() => displayLoggedInState())
            .catch(e => console.log('error: ', e));
    } else {
        console.log('Already logged in:', stitchClient.authedId())
    }
}
```

#### `logout`

```javascript
function logout() {
    if (stitchClient.authedId()) {
        stitchClient.logout()
            .then(() => displayLoggedOutState())
            .then(() => console.log('logged out!'))
            .catch(e => console.log('error: ', e));
    }
}
```

### 5 - Test That Everything Works

    // TODO: Walk through logging in and sending an email.