package main

import (
	"cartercobb/m/pkg/user"
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
	"github.com/golang-jwt/jwt"
	"strings"
)

var (
	dynaClient dynamodbiface.DynamoDBAPI
)

const jwtSecret = "jysyVggrzwwioncbTAGckMSGsyZizuXtlSTkyKojvtDSWYLDCTeRkpjaInxBvJtHxAKtSvRYuSTJrvPQceMwcUPpBAKKnjLnQvFI"

func generatePolicy(principalId, uid string, effect, resource string) events.APIGatewayCustomAuthorizerResponse {
	authResponse := events.APIGatewayCustomAuthorizerResponse{PrincipalID: principalId}

	if effect != "" && resource != "" {
		authResponse.PolicyDocument = events.APIGatewayCustomAuthorizerPolicy{
			Version: "2012-10-17",
			Statement: []events.IAMPolicyStatement{
				{
					Action:   []string{"execute-api:Invoke"},
					Effect:   effect,
					Resource: []string{resource},
				},
			},
		}
	}

	authResponse.Context = map[string]interface{}{
		"uid": uid,
	}
	return authResponse
}

func handleRequest(ctx context.Context, event events.APIGatewayCustomAuthorizerRequest) (events.APIGatewayCustomAuthorizerResponse, error) {
	token := strings.Split(event.AuthorizationToken, " ")[1]
	token_parsed, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return events.APIGatewayCustomAuthorizerResponse{}, errors.New("Unexpected error:" + err.Error())
	}

	if claims, ok := token_parsed.Claims.(jwt.MapClaims); ok && token_parsed.Valid {
		result, err := user.FetchUser(claims["uid"].(string), "users", dynaClient)
		if err != nil {
			return events.APIGatewayCustomAuthorizerResponse{}, errors.New("Unexpected error:" + err.Error())
		}
		if result == nil {
			return generatePolicy("user", result.UID, "Deny", event.MethodArn), nil
		} else {
			return generatePolicy("user", result.UID, "Allow", event.MethodArn), nil
		}
	} else {
		return events.APIGatewayCustomAuthorizerResponse{}, errors.New("Error: Invalid token")
	}
}

func main() {
	region := "us-west-1"
	awsSession, err := session.NewSession(&aws.Config{
		Region: aws.String(region)},
	)
	if err != nil {
		return
	}
	dynaClient = dynamodb.New(awsSession)
	lambda.Start(handleRequest)
}
