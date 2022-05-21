package user

// This file defines the book resource and implements its database interactions.
// Most raw business logic for books.

import (
	"encoding/json"
	"errors"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
	"github.com/google/uuid"
)

var (
	ErrorFailedToUnmarshalRecord = "failed to unmarshal record"
	ErrorFailedToFetchRecord     = "failed to fetch record"
	ErrorInvalidUserData         = "invalid user data"
	ErrorInvalidUID              = "invalid UID"
	ErrorCouldNotMarshalItem     = "could not marshal item"
	ErrorCouldNotDeleteItem      = "could not delete item"
	ErrorCouldNotDynamoPutItem   = "could not dynamo put item error"
	ErrorUserAlreadyExists       = "user.User already exists"
	ErrorUserDoesNotExists       = "user.User does not exist"
	ErrorUserUpdateError         = "cannot update foreign user object"
)

type User struct {
	UID      string `json:"uid"`
	UserName string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"` // `USER` or `LIBRARIAN`
}

// Handles getting one user from the database (DynamoDB)
// returns the user or nil
func FetchUser(ibsn, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (*User, error) {
	input := &dynamodb.GetItemInput{
		Key: map[string]*dynamodb.AttributeValue{
			"uid": {
				S: aws.String(ibsn),
			},
		},
		TableName: aws.String(tableName),
	}

	result, err := dynaClient.GetItem(input)
	if err != nil {
		return nil, errors.New(ErrorFailedToFetchRecord + err.Error())
	}

	item := new(User)
	err = dynamodbattribute.UnmarshalMap(result.Item, item)
	if err != nil {
		return nil, errors.New(ErrorFailedToUnmarshalRecord)
	}
	return item, nil
}

// Librarian only method
// Handles getting all users from the database (DynamoDB)
// returns []User or nil, if no Users available: []
func FetchUsers(tableName string, dynaClient dynamodbiface.DynamoDBAPI) (*[]User, error) {
	input := &dynamodb.ScanInput{
		TableName: aws.String(tableName),
	}
	result, err := dynaClient.Scan(input)
	if err != nil {
		return nil, errors.New(ErrorFailedToFetchRecord + err.Error())
	}
	item := new([]User)
	_ = dynamodbattribute.UnmarshalListOfMaps(result.Items, item)
	return item, nil
}

// Create a user from the request body.
// returns new user or nil
func CreateUser(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
	*User,
	error,
) {
	var u User
	if err := json.Unmarshal([]byte(req.Body), &u); err != nil {
		return nil, errors.New(ErrorInvalidUserData)
	}
	u.UID = uuid.New().String()
	// Check if User exists
	currentUser, _ := FetchUser(u.UID, tableName, dynaClient)
	if currentUser != nil && len(currentUser.UID) != 0 {
		return nil, errors.New(ErrorUserAlreadyExists)
	}
	// Save User
	av, err := dynamodbattribute.MarshalMap(u)
	if err != nil {
		return nil, errors.New(ErrorCouldNotMarshalItem)
	}

	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String(tableName),
	}

	_, err = dynaClient.PutItem(input)
	if err != nil {
		return nil, errors.New(ErrorCouldNotDynamoPutItem)
	}
	return &u, nil
}

// Only updates the user that calls the request
// Update a user by properties passed through body.
// e.g. pass `uid` to req.Body alongside the properties to update
// returns updated user or nil
func UpdateUser(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
	*User,
	error,
) {
	var u User
	if err := json.Unmarshal([]byte(req.Body), &u); err != nil {
		return nil, errors.New(ErrorInvalidUID)
	}

	// Check if User exists
	currentUser, _ := FetchUser(u.UID, tableName, dynaClient)
	if currentUser != nil && len(currentUser.UID) == 0 {
		return nil, errors.New(ErrorUserDoesNotExists)
	}
	if u.UID != currentUser.UID {
		return nil, errors.New(ErrorUserUpdateError)
	}
	// Save User
	av, err := dynamodbattribute.MarshalMap(u)
	if err != nil {
		return nil, errors.New(ErrorCouldNotMarshalItem)
	}

	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String(tableName),
	}

	_, err = dynaClient.PutItem(input)
	if err != nil {
		return nil, errors.New(ErrorCouldNotDynamoPutItem)
	}
	return &u, nil
}

// Delete a user by thier `uid`
// returns nil (204 No Content)
func DeleteUser(ibsn string, tableName string, dynaClient dynamodbiface.DynamoDBAPI) error {
	input := &dynamodb.DeleteItemInput{
		Key: map[string]*dynamodb.AttributeValue{
			"uid": {
				S: aws.String(ibsn),
			},
		},
		TableName: aws.String(tableName),
	}
	_, err := dynaClient.DeleteItem(input)
	if err != nil {
		return errors.New(ErrorCouldNotDeleteItem)
	}

	return nil
}
