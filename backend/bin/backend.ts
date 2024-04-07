#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { BackendStack } from "../lib/backend-stacks";

const app = new cdk.App();
new BackendStack(app, "BackendStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stage: process.env.STAGE!

});
