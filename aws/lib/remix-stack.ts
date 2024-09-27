import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path = require('path');
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { RemixServer } from './remix-server';
import { RemixDistribution } from './remix-distribution';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

export class RemixStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const publicDir = path.join(__dirname, '../../build/client')
    const server = path.join(__dirname, "../../server.ts")
    
    const remixStaticBucket = new Bucket(this, "RemixStaticBucket", {
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
    
    const remixServer = new RemixServer(this, "RemixServer", { server })
    
    const remixDistribution = new RemixDistribution(this, "RemixDistribution", {
      bucket: remixStaticBucket,
      serverApiUrl: remixServer.apiUrl
    })
    
    new BucketDeployment(this, "RemixBucketDeployment", {
      sources: [Source.asset(publicDir)],
      destinationBucket: remixStaticBucket,
      distribution: remixDistribution.distribution,
    })
    
    new cdk.CfnOutput(this, "RemixCloudfrontDomainName", {
      value: remixDistribution.distribution.distributionDomainName
    })
  }
}
