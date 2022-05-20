package handlers

// This file will contain all the top upper most business logic.
// e.g. The interaction with vaious resources. NOT the database interactions
    
import (
  "cartercobb/m/pkg/book"
  "net/http"
  "github.com/aws/aws-lambda-go/events"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
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
  ibsn := req.PathParameters["ibsn"]
  if len(ibsn) > 0 {
	  // Get single book
	  result, err := book.FetchBook(ibsn, tableName, dynaClient)
	  if err != nil {
		  return apiResponse(http.StatusBadRequest, ErrorBody{aws.String(err.Error())})
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
func CreateBook(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
  *events.APIGatewayProxyResponse,
  error,
) {
  result, err := book.CreateBook(req, tableName, dynaClient)
  if err != nil {
	  return apiResponse(http.StatusBadRequest, ErrorBody{
		  aws.String(err.Error()),
	  })
  }
  return apiResponse(http.StatusCreated, result)
}

// Update a book by properties passed through body.
// e.g. pass `ibsn` to req.Body alongside the properties to update
// returns an api response with applicable data
func UpdateBook(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
  *events.APIGatewayProxyResponse,
  error,
) {
  result, err := book.UpdateBook(req, tableName, dynaClient)
  if err != nil {
	  return apiResponse(http.StatusBadRequest, ErrorBody{
		  aws.String(err.Error()),
	  })
  }
  return apiResponse(http.StatusOK, result)
}

// Delete a book by its `ibsn`
// returns an api response with applicable data
func DeleteBook(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
  *events.APIGatewayProxyResponse,
  error,
) {
  ibsn := req.PathParameters["ibsn"]
  err := book.DeleteBook(ibsn, tableName, dynaClient)
  if err != nil {
	  return apiResponse(http.StatusBadRequest, ErrorBody{
		  aws.String(err.Error()),
	  })
  }
  return apiResponse(http.StatusNoContent, nil)
}

// Handles 405 errors (unsupported methods on the `book` resource)
// returns an api response with applicable data
func UnhandledMethod() (*events.APIGatewayProxyResponse, error) {
  return apiResponse(http.StatusMethodNotAllowed, ErrorMethodNotAllowed)
}