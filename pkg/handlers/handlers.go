package handlers

// This file will contain all the top upper most business logic.
// e.g. The interaction with vaious resources. NOT the database interactions

import (
	"cartercobb/m/pkg/book"
	"cartercobb/m/pkg/user"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
	"net/http"
)

var ErrorMethodNotAllowed = "method Not allowed"

type ErrorBody struct {
	ErrorMsg *string `json:"error,omitempty"`
}

// Handles getting one or many books from the database (DynamoDB)
// if a path parameter is ommited or nil, the function will gather all of the books in the database
// returns an api response with applicable data
func GetBook(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
	*events.APIGatewayProxyResponse,
	error,
) {
	isbn := req.PathParameters["isbn"]
	if len(isbn) > 0 {
		// Get single book
		result, err := book.FetchBook(isbn, tableName, dynaClient)
		if err != nil {
			return apiResponse(http.StatusBadRequest, ErrorBody{aws.String(err.Error())})
		}
		if result == nil {
			return apiResponse(http.StatusNotFound, nil)
		}

		return apiResponse(http.StatusOK, result)
	}
	// Get list of books
	result, err := book.FetchBooks(tableName, dynaClient)
	if err != nil {
		return apiResponse(http.StatusBadRequest, ErrorBody{
			aws.String(err.Error()),
		})
	}
	return apiResponse(http.StatusOK, result)
}

// Create a book from the request body.
// returns an api response with applicable data
func CreateBook(req events.APIGatewayProxyRequest, bookTable string, usersTable string, dynaClient dynamodbiface.DynamoDBAPI) (
	*events.APIGatewayProxyResponse,
	error,
) {
	uid := req.RequestContext.Authorizer["uid"]
	result, err := book.CreateBook(req, uid.(string), bookTable, usersTable, dynaClient)
	if err != nil {
		return apiResponse(http.StatusBadRequest, ErrorBody{
			aws.String(err.Error()),
		})
	}
	return apiResponse(http.StatusCreated, result)
}

// Update a book by properties passed through body.
// e.g. pass `isbn` to req.Body alongside the properties to update
// returns an api response with applicable data
func UpdateBook(req events.APIGatewayProxyRequest, bookTable string, usersTable string, dynaClient dynamodbiface.DynamoDBAPI) (
	*events.APIGatewayProxyResponse,
	error,
) {
	uid := req.RequestContext.Authorizer["uid"]
	result, err := book.UpdateBook(req, uid.(string), bookTable, usersTable, dynaClient)
	if err != nil {
		return apiResponse(http.StatusBadRequest, ErrorBody{
			aws.String(err.Error()),
		})
	}
	return apiResponse(http.StatusOK, result)
}

// Delete a book by its `isbn`
// returns an api response with applicable data
func DeleteBook(req events.APIGatewayProxyRequest, bookTable string, usersTable string, dynaClient dynamodbiface.DynamoDBAPI) (
	*events.APIGatewayProxyResponse,
	error,
) {
	isbn := req.PathParameters["isbn"]
	uid := req.RequestContext.Authorizer["uid"]
	err := book.DeleteBook(isbn, uid.(string), bookTable, usersTable, dynaClient)
	if err != nil {
		return apiResponse(http.StatusBadRequest, ErrorBody{
			aws.String(err.Error()),
		})
	}
	return apiResponse(http.StatusNoContent, nil)
}

// Checkout a book by its isbn
// Requires auth
// Updates the books inventory and adds to its state array
func CheckoutBook(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
	*events.APIGatewayProxyResponse,
	error,
) {
	isbn := req.PathParameters["isbn"]
	uid := req.RequestContext.Authorizer["uid"]
	result, err := book.CheckoutBook(isbn, uid.(string), "books", "users", dynaClient)
	if err != nil {
		return apiResponse(http.StatusBadRequest, ErrorBody{
			aws.String(err.Error()),
		})
	}
	return apiResponse(http.StatusOK, result)
}

// Return a book by its isbn
// Requires auth
// Updates the books inventory and adds to its state array
func ReturnBook(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
	*events.APIGatewayProxyResponse,
	error,
) {
	isbn := req.PathParameters["isbn"]
	uid := req.RequestContext.Authorizer["uid"]
	result, err := book.ReturnBook(isbn, uid.(string), "books", "users", dynaClient)
	if err != nil {
		return apiResponse(http.StatusBadRequest, ErrorBody{
			aws.String(err.Error()),
		})
	}
	return apiResponse(http.StatusOK, result)
}

// Handles getting one or many users from the database (DynamoDB)
// if a path parameter is ommited or nil, the function will gather all of the user in the database
// returns an api response with applicable data
func GetUser(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
	*events.APIGatewayProxyResponse,
	error,
) {
	uid := req.PathParameters["uid"]
	if len(uid) > 0 {
		// Get single user
		result, err := user.FetchUser(uid, tableName, dynaClient)
		if err != nil {
			return apiResponse(http.StatusBadRequest, ErrorBody{aws.String(err.Error())})
		}
		if result == nil {
			return apiResponse(http.StatusNotFound, nil)
		}

		return apiResponse(http.StatusOK, result)
	}
	// Get list of users
	uid_auth := req.RequestContext.Authorizer["uid"]
	result, err := user.FetchUsers(uid_auth.(string), tableName, dynaClient)
	if err != nil {
		return apiResponse(http.StatusBadRequest, ErrorBody{
			aws.String(err.Error()),
		})
	}
	return apiResponse(http.StatusOK, result)
}

// Create a user from the request body.
// returns an api response with applicable data
func CreateUser(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
	*events.APIGatewayProxyResponse,
	error,
) {
	result, err := user.CreateUser(req, tableName, dynaClient)
	if err != nil {
		return apiResponse(http.StatusBadRequest, ErrorBody{
			aws.String(err.Error()),
		})
	}
	return apiResponse(http.StatusCreated, result)
}

// Update a user by properties passed through body.
// e.g. pass `uid` to req.Body alongside the properties to update
// returns an api response with applicable data
func UpdateUser(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
	*events.APIGatewayProxyResponse,
	error,
) {
	uid := req.RequestContext.Authorizer["uid"]
	result, err := user.UpdateUser(req, uid.(string), tableName, dynaClient)
	if err != nil {
		return apiResponse(http.StatusBadRequest, ErrorBody{
			aws.String(err.Error()),
		})
	}
	return apiResponse(http.StatusOK, result)
}

// Delete a user by its `uid`
// returns an api response with applicable data
func DeleteUser(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
	*events.APIGatewayProxyResponse,
	error,
) {
	uid := req.RequestContext.Authorizer["uid"]
	err := user.DeleteUser(req, uid.(string), tableName, dynaClient)
	if err != nil {
		return apiResponse(http.StatusBadRequest, ErrorBody{
			aws.String(err.Error()),
		})
	}
	return apiResponse(http.StatusNoContent, nil)
}

// logges a user in by their username and password.
// e.g. pass `username` & `password` to req.Body
// returns jwt token
func Login(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
	*events.APIGatewayProxyResponse,
	error,
) {
	result, err := user.Login(req, tableName, dynaClient)
	if err != nil {
		return apiResponse(http.StatusBadRequest, ErrorBody{
			aws.String(err.Error()),
		})
	}
	return apiResponse(http.StatusOK, result)
}

// Handles 405 errors (unsupported methods on the `book` resource)
// returns an api response with applicable data
func UnhandledMethod() (*events.APIGatewayProxyResponse, error) {
	return apiResponse(http.StatusMethodNotAllowed, ErrorMethodNotAllowed)
}
