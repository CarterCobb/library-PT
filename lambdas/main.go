package main

import (
	"cartercobb/m/pkg/handlers"
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
	"os"
	"strings"
)

var (
	dynaClient dynamodbiface.DynamoDBAPI
)

const bookTable = "books"
const usersTable = "users"
const jwtSecret = "jysyVggrzwwioncbTAGckMSGsyZizuXtlSTkyKojvtDSWYLDCTeRkpjaInxBvJtHxAKtSvRYuSTJrvPQceMwcUPpBAKKnjLnQvFI"

func UserHandler(req events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	switch req.HTTPMethod {
	case "GET":
		return handlers.GetUser(req, usersTable, dynaClient)
	case "POST":
		if strings.Contains(req.Path, "login") {
			return handlers.Login(req, usersTable, dynaClient)
		}
		return handlers.CreateUser(req, usersTable, dynaClient)
	case "PATCH":
		return handlers.UpdateUser(req, usersTable, dynaClient)
	case "DELETE":
		return handlers.DeleteUser(req, usersTable, dynaClient)
	default:
		return handlers.UnhandledMethod()
	}
}

func BookHandler(req events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	switch req.HTTPMethod {
	case "GET":
		return handlers.GetBook(req, bookTable, dynaClient)
	case "POST":
		return handlers.CreateBook(req, bookTable, usersTable, dynaClient)
	case "PATCH":
		return handlers.UpdateBook(req, bookTable, usersTable, dynaClient)
	case "DELETE":
		return handlers.DeleteBook(req, bookTable, usersTable, dynaClient)
	default:
		return handlers.UnhandledMethod()
	}
}

func BookActionsHandler(req events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	switch req.HTTPMethod {
	case "POST":
		if strings.Contains(req.Path, "/checkout") {
			return handlers.CheckoutBook(req, bookTable, dynaClient)
		}
		return handlers.ReturnBook(req, bookTable, dynaClient)
	default:
		return handlers.UnhandledMethod()
	}
}

func UnKnownHandler(req events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	return handlers.UnhandledMethod()
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
	f_type := os.Getenv("F_TYPE")
	switch f_type {
	case "authorizer":
		lambda.Start(HandleAuthorize)
	case "book":
		lambda.Start(BookHandler)
	case "user":
		lambda.Start(UserHandler)
	case "book-actions":
		lambda.Start(BookActionsHandler)
	default:
		lambda.Start(UnKnownHandler)
	}
}

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

func HandleAuthorize(ctx context.Context, event events.APIGatewayCustomAuthorizerRequest) (events.APIGatewayCustomAuthorizerResponse, error) {
	token := strings.Split(event.AuthorizationToken, " ")[1]
	token_parsed, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
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
		return events.APIGatewayCustomAuthorizerResponse{}, errors.New("error: Invalid token")
	}
}
