import { Duration, Stack } from "aws-cdk-lib";
import { HttpApi } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { LogLevel, NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import path = require("path");

type RemixServerProps = {
    server: string;
}

export class RemixServer extends Construct {
    apiUrl: string;
    constructor(scope: Construct, id: string, props: RemixServerProps) {
        super(scope, id);
        const lambdaFn = new NodejsFunction( this, "RemixLambdaFn",
            {
                runtime: Runtime.NODEJS_20_X,
                entry: props.server,
                bundling: {
                    esbuildArgs: {
                        "--tree-shaking": true,
                    },
                    format: OutputFormat.CJS,
                    logLevel: LogLevel.INFO,
                    minify: true,
                    tsconfig: path.join(__dirname, "../../tsconfig.json"),
                    nodeModules: [
                        "@remix-run/architect"
                    ]
                },
                timeout: Duration.seconds(10),
                logRetention: RetentionDays.ONE_WEEK,
            }
        );
        
        const lambdaIntegration = new HttpLambdaIntegration("RemixLambdaIntegration", lambdaFn)
        
        const httpApi = new HttpApi(this, "RemixHttpApi", {
            apiName: scope.node.id,
            defaultIntegration: lambdaIntegration
        })
        
        this.apiUrl = `${httpApi.httpApiId}.execute-api.${Stack.of(this).region}.${Stack.of(this).urlSuffix}`
    }
}