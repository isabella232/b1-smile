# Smile Survey - Face recognition and Qualtrics APIs
This application feeds a Qualtrics survey with the user's rating given a selfie analysed by the Amazon Rekognition API. 
It also merges the selfie with stickers (other smaller pictures) in case user wants to save it and share to social network.
<p align="center">
  <a href="https://youtu.be/XxXVHi6-gsw">
  <img src="https://i.imgur.com/IbODvMZ.gif">
  </a>
</p>

### Prerequisites
A free trial account on SAP Cloud Platform with Cloud Foundry Trial initialized;
The Cloud Foundry Command Line Interface (CLI) on your machine;
A Qualtrics Survey with API access

### Overview
- It is coded in [NodeJs](https://nodejs.org/en/)
- Can be deployed anywhere and I suggest to do it in the [SAP Cloud Platform](https://cloudplatform.sap.com). 
- It makes use of the [Amazon Rekognition](https://aws.amazon.com/es/rekognition/), [Qualtrics APIs](https://api.qualtrics.com/) and [Sharp library (NodeJs)](https://github.com/lovell/sharp)

### Deployment to the Cloud Foundry
Clone this repository
```sh
$ git clone https://github.com/mendesthi/smilesurvey.git
```
Give a name to your app on the [manifest.yml](manifest.yml)

From the root directory, using the [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html) push your app to the SAP CP Cloud Foundry
```sh
$ cf push
```

It requires the Qualtrics Tenant, Qualtrics API Survey ID and API Token so you can get programmatic access to the required resources.

The Qualtrics tenant is part of the URL of the tenant your Qualtrics Survey. 
Suppose the URL for your tenant is https://sapinsights.eu.qualtrics.com/ then you need to set the value "sapinsights.eu" to your ***QUALTRICS_TENANT*** variable;

See [here](https://www.qualtrics.com/support/integrations/api-integration/finding-qualtrics-ids/) how to retrieve Qualtrics API Token and Survey ID, and set them to the environment variables ***QUALTRICS_TOKEN*** and ***QUALTRICS_SURVEYID***;

It also requires to configure credentials for AWS SDK.
Check the instructions on [this post](https://medium.com/@prasadjay/amazon-cognito-user-pools-in-nodejs-as-fast-as-possible-22d586c5c8ec) to configure them properly.

Then you finally configure your app as an app client into your user pool. Follow the instructions on this [Amazon Cognito Developer Guide](https://docs.aws.amazon.com/pt_br/cognito/latest/developerguide/user-pool-settings-client-apps.html) to do so.

The AWS s3 is used to temporarly store the picture so the user can download and save it. 
[Create a new bucket](https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingBucket.html#create-bucket-intro) on aws s3 and note the bucket name.

Now you have all the AWS and Qualtrics information required, set them to the Cloud Foundry environments:

```sh
$ cf set-env <appname> AWS_ACCESS_KEY <your_aws_access_key>
$ cf set-env <appname> AWS_CLIENTID <your_aws_client_id>
$ cf set-env <appname> AWS_SECRET_KEY <your_aws_secret_key>

$ cf set-env <appname> AWS_POOLID <your_aws_pool_id>
$ cf set-env <appname> AWS_USERPOOLID <your_aws_user_pool_id>

$ cf set-env <appname> AWS_USERNAME <your_aws_user_name>
$ cf set-env <appname> AWS_PASSWORD <your_aws_password>
$ cf set-env <appname> AWS_REGION <your_aws_region>

$ cf set-env <appname> AWS_BUCKET <your_aws_S3_bucket_name>

$ cf set-env <appname> QUALTRICS_SURVEYID <your_aws_access_key>
$ cf set-env <appname> QUALTRICS_TENANT <your_aws_access_key>
$ cf set-env <appname> QUALTRICS_TOKEN <your_aws_access_key>
```

Restart your application (so it can read the new environment variables):
```sh
$ cf restart <appname>
```

Now access the app from the URL route shown in the terminal.

To check that your environment variables have been set correctly, run the following command:
```sh
$ cf env <appname>
```

You should get a list like this:
```sh
User-Provided:
AWS_ACCESS_KEY: ABCDE1FG2HIJKLMNOP3QR
AWS_BUCKET: smilebucket
AWS_CLIENTID: 1a2bb3cdefg45h67t2z1tv5ou4
AWS_PASSWORD: MyPassword
AWS_POOLID: eu-west-1:1v2v3h44-5678-9h10-1wd2-1234567aa123
AWS_REGION: eu-west-1
AWS_SECRET_KEY: tABCcDEF1abcdEfGhIJK/12a$bc3ddEFgHiJKL/m
AWS_USERNAME: thecastro
AWS_USERPOOLID: eu-west-1_ABCdE1G2I
QUALTRICS_SURVEYID: SV_cPdRNZGwsIudugh
QUALTRICS_TENANT: sapinsights.eu
QUALTRICS_TOKEN: H0Ce5sn8ejjgFZL7yprCDvyfF7l2puOrA6Lm0D9Y
```

# Demo app
There is a sample implementation [running here](https://smiletcm-happy-buffalo.cfapps.eu10.hana.ondemand.com/).

# License
smilesurvey is released under the terms of the MIT license. See [LICENSE](LICENSE) for more information or see https://opensource.org/licenses/MIT.
