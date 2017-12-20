# Integrate Amazon SES

Amazon Simple Email Service (SES) is an email service provided by Amazon
as part of their AWS cloud platform. SES makes it straightforward to
send transactional, marketing, and other types of email quickly and
programmatically. In this walkthrough, we'll demonstrate how to
integrate Amazon SES into a web application using the MongoDB Stitch SES
service module.

## Prerequisites
- Stitch App
- AWS Account

## Preview

This walkthrough will focus on integrating the MongoDB Stitch SES
Service into a simple html form. Once we've integrated SES into the web
app, users will be able to authenticate to MongoDB Stitch and enter
their email address to receive a friendly message. We'll use the
following HTML as a base:

```html
<div>Include base HTML here</div>
```

## Procedure

### 1 - Set Up SES

#### Verify Sender Address

You must verify ownership of an email address before you can use it to
send email with SES.

1. Navigate to the [SES Management Console](https://console.aws.amazon.com/) and sign in to your AWS account.
2. In the left navigation, click **Email Addresses** under the **Identity Management** section.
3. On the **Email Addresses** page, click the **Verify a New Email Address** button.
4. Enter the email address you wish to  send email from.
5. Follow the link in the confirmation email sent to the address you entered.

You should now have an email address that can be used to send email with SES.

> **Note**
> If you have not requested an increased send limit, Amazon SES will be
> in sandbox mode. While in sandbox mode your email throughput is
> limited and you must verify both addresses you wish to send email to
> as well as addresses you want to send from. 

#### Set Up IAM Credentials

SES can tap into the powerful suite of identity and access management tools provided by AWS.
For production deployments you should follow best practices by creating IAM roles and users 
and using credentials generated for these roles and users instead of your root `Access Key ID` 
and `Secret Access Key`.

    // TODO: Walk through creating IAM User and getting credentials.

### 2 - Set Up MongoDB Stitch

#### Define Values



#### Create Valid Email Test Function


#### Configure the SES Service

Once you have verified your sender email address and acquired an `Access Key ID` and
`Secret Access Key`, you are ready to connect to SES through MongoDB Stitch.

1. Navigate to the main console of your Stitch app.
2. In the left navigation, click **Services** under the **Control** section.
3. On the **Services** page, click the **Add a Service** button.
4. Select the **SES** service and fill in the configuration details.
    - **Service Name:** `ses`
    - **Region:** `us-east-1`
    - **Access Key ID:** The Access Key ID you acquired when setting up SES.
    - **Secret Access Key:** The Secret Access Key you acquired when setting up SES.
5. After creating the new SES service, navigate to the **Rules** tab and
   click the **New Rule** button. Name the rule whatever you'd like.
6. After you've created a new rule, toggle **send** on in the **Actions** section.
7. Add the following filter document in the **When** section:

```javascript
    {
        "%%args.fromAddress": "nlarew864@gmail.com",
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


### 3 - Create `sendEmail` Function

#### `verifyEmail`
```javascript
exports = function(candidate){
  // There is no perfect email regex: https://www.regular-expressions.info/email.html
  var isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  
  return isEmail.test(candidate);
};
```

#### `sendEmail`
```javascript
function sendEmailToMongoDB(subject, body) {
    stitchClient.executeServiceFunction('email', 'send', {
        "toAddress": "nick.larew@mongodb.com",
        "body": body,
        "fromAddress": "nlarew864@gmail.com",
        "subject": subject
      }).then(res => console.log('res;', res), err => console.log('err:', err));
    }
```

### 4 - Web App Javascript

Add the following code to the `<script>` tag at the bottom of the base HTML's `<body>` tag:

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

### 5 - Put It All Together

    