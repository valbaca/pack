import { AllowedMethods, CachePolicy, Distribution, OriginAccessIdentity, OriginRequestPolicy, PriceClass, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin, S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";


type RemixDistributionProps = {
    bucket: IBucket,
    serverApiUrl: string
}
export class RemixDistribution extends Construct {
    distribution: Distribution;
    constructor(scope: Construct, id: string, props: RemixDistributionProps) {
        super(scope, id)

        const bucketOriginId = new OriginAccessIdentity(this, "RemixDistributionBucketOriginAccessId")
        props.bucket.grantRead(bucketOriginId)

        const staticFilesBehavior = { 
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
            cachePolicy: CachePolicy.CACHING_OPTIMIZED,
            compress: true,
            origin: S3BucketOrigin.withOriginAccessControl(props.bucket, {
                originAccessControlId: bucketOriginId.originAccessIdentityId
            }),
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        }

        this.distribution = new Distribution(this, "RemixCloudfrontDistribution", {
            priceClass: PriceClass.PRICE_CLASS_100, // NA & EU
            enableLogging: false,
            defaultBehavior: {
                allowedMethods: AllowedMethods.ALLOW_ALL,
                cachePolicy: CachePolicy.CACHING_DISABLED,
                compress: true,
                origin: new HttpOrigin(props.serverApiUrl),
                originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            },
            additionalBehaviors: {
                // I think there's a better way to do this, but going with this as it's working
                "/*.png": staticFilesBehavior,
                "/assets/*": staticFilesBehavior
            }
        })
    }
}