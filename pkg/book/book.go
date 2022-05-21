package book

// This file defines the book resource and implements its database interactions.
// Most raw business logic for books.

import (
	// "cartercobb/m/pkg/user"
	"encoding/json"
	"errors"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
	"time"
)

// // Get requesting user
// usr, err := user.FetchUser(uid, userTable, dynaClient)
// if err != nil {
// 	return nil, errors.New(err.Error())
// }

var (
	ErrorFailedToUnmarshalRecord = "failed to unmarshal record"
	ErrorFailedToFetchRecord     = "failed to fetch record"
	ErrorInvalidBookData         = "invalid book data"
	ErrorInvalidIBSN             = "invalid IBSN"
	ErrorCouldNotMarshalItem     = "could not marshal item"
	ErrorCouldNotDeleteItem      = "could not delete item"
	ErrorCouldNotDynamoPutItem   = "could not dynamo put item error"
	ErrorBookAlreadyExists       = "book.Book already exists"
	ErrorBookDoesNotExists       = "book.Book does not exist"
	ErrorBookNotAvailable        = "book.Book does not have sufficient inventory"
	ErrorDidNotCheckout          = "cannot return a book that wasnt checked out to you"
)

type BookState struct {
	CheckedOut   bool   `json:"checkedOut"`
	CheckoutDate string `json:"checkoutDate"`
	Quantity     int    `json:"quantity"`
	Returned     bool   `json:"returned"`
	ReturnDate   string `json:"returnDate"`
	User         string `json:"user"`
}

type Book struct {
	IBSN        string      `json:"ibsn"`
	Title       string      `json:"title"`
	Author      string      `json:"author"`
	Description string      `json:"description"`
	Inventory   int         `json:"inventory"`
	States      []BookState `json:"states"`
	UpdatedAt   string      `json:"updatedAt"`
}

// Handles getting one book from the database (DynamoDB)
// returns the book or nil
func FetchBook(ibsn, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (*Book, error) {
	input := &dynamodb.GetItemInput{
		Key: map[string]*dynamodb.AttributeValue{
			"ibsn": {
				S: aws.String(ibsn),
			},
		},
		TableName: aws.String(tableName),
	}

	result, err := dynaClient.GetItem(input)
	if err != nil {
		return nil, errors.New(ErrorFailedToFetchRecord + err.Error())
	}

	item := new(Book)
	err = dynamodbattribute.UnmarshalMap(result.Item, item)
	if err != nil {
		return nil, errors.New(ErrorFailedToUnmarshalRecord)
	}
	if item.IBSN == "" {
		return nil, nil
	}
	return item, nil
}

// Handles getting all books from the database (DynamoDB)
// returns []Book or nil, if no books available: []
func FetchBooks(tableName string, dynaClient dynamodbiface.DynamoDBAPI) (*[]Book, error) {
	input := &dynamodb.ScanInput{
		TableName: aws.String(tableName),
	}
	result, err := dynaClient.Scan(input)
	if err != nil {
		return nil, errors.New(ErrorFailedToFetchRecord + err.Error())
	}
	item := new([]Book)
	_ = dynamodbattribute.UnmarshalListOfMaps(result.Items, item)
	return item, nil
}

// Create a book from the request body.
// returns new book or nil
func CreateBook(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
	*Book,
	error,
) {
	var u Book
	if err := json.Unmarshal([]byte(req.Body), &u); err != nil {
		return nil, errors.New(ErrorInvalidBookData)
	}
	// Check if Book exists
	currentBook, _ := FetchBook(u.IBSN, tableName, dynaClient)
	if currentBook != nil && len(currentBook.IBSN) != 0 {
		return nil, errors.New(ErrorBookAlreadyExists)
	}
	// Save Book

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

// Update a book by properties passed through body.
// e.g. pass `ibsn` to req.Body alongside the properties to update
// returns updated book or nil
func UpdateBook(req events.APIGatewayProxyRequest, tableName string, dynaClient dynamodbiface.DynamoDBAPI) (
	*Book,
	error,
) {
	var u Book
	if err := json.Unmarshal([]byte(req.Body), &u); err != nil {
		return nil, errors.New(ErrorInvalidIBSN)
	}

	// Check if Book exists
	currentBook, _ := FetchBook(u.IBSN, tableName, dynaClient)
	if currentBook != nil && len(currentBook.IBSN) == 0 {
		return nil, errors.New(ErrorBookDoesNotExists)
	}
	// Keep unmutated properties the same as before
	if u.Author == "" {
		u.Author = currentBook.Author
	}
	if u.Description == "" {
		u.Description = currentBook.Description
	}
	if u.Inventory == 0 {
		u.Inventory = currentBook.Inventory
	}
	if u.Title == "" {
		u.Title = currentBook.Title
	}
	u.UpdatedAt = time.Now().Local().String()
	u.States = currentBook.States

	// Save Book
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

// Delete a book by its `ibsn`
// returns nil (204 No Content)
func DeleteBook(ibsn string, tableName string, dynaClient dynamodbiface.DynamoDBAPI) error {
	input := &dynamodb.DeleteItemInput{
		Key: map[string]*dynamodb.AttributeValue{
			"ibsn": {
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

// Checkout a book and add to its state array.
// Returns the checked out book
func CheckoutBook(ibsn string, uid string, bookTable string, userTable string, dynaClient dynamodbiface.DynamoDBAPI) (*Book, error) {
	var u Book
	// Check if Book exists
	currentBook, _ := FetchBook(ibsn, bookTable, dynaClient)
	if currentBook == nil {
		return nil, errors.New(ErrorBookDoesNotExists)
	}
	if currentBook.Inventory-1 < 0 {
		return nil, errors.New(ErrorBookNotAvailable)
	}

	u.Author = currentBook.Author
	u.Description = currentBook.Description
	u.IBSN = currentBook.IBSN
	u.Title = currentBook.Title
	u.UpdatedAt = time.Now().Local().String()
	u.Inventory = currentBook.Inventory - 1

	var state BookState

	for _, v := range currentBook.States {
		if v.User == uid {
			state = v
			break
		}
	}

	if (BookState{} == state) {
		state.Quantity = 1
		state.CheckedOut = true
		state.CheckoutDate = time.Now().Local().String()
		state.Returned = false
		state.User = uid
		u.States = append(currentBook.States, state)
	} else {
		var states = currentBook.States
		for i, v := range states {
			if v.User == uid {
				state.Quantity = v.Quantity + 1
				states = append(states[0:i], states[i+1:]...)
				break
			}
		}
		u.States = append(states, state)
	}

	// Save Book
	av, err := dynamodbattribute.MarshalMap(u)
	if err != nil {
		return nil, errors.New(ErrorCouldNotMarshalItem)
	}

	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String(bookTable),
	}

	_, err = dynaClient.PutItem(input)
	if err != nil {
		return nil, errors.New(ErrorCouldNotDynamoPutItem)
	}
	return &u, nil
}

// Return a book that was previously checkoued out and add to its state array.
// Book must reflect a state where the requesting user checked out a book.
// Returns the checked out book
func ReturnBook(ibsn string, uid string, bookTable string, userTable string, dynaClient dynamodbiface.DynamoDBAPI) (*Book, error) {
	var u Book
	// Check if Book exists
	currentBook, _ := FetchBook(ibsn, bookTable, dynaClient)
	if currentBook == nil {
		return nil, errors.New(ErrorBookDoesNotExists)
	}

	var state BookState

	for _, v := range currentBook.States {
		if v.User == uid {
			state = v
			break
		}
	}

	if (BookState{} == state) {
		// This user did not checkout the book, therefore cannot be returned
		return nil, errors.New(ErrorDidNotCheckout)
	} else {
		var states = currentBook.States
		for i, v := range states {
			if v.User == uid {
				if v.Quantity-1 < 0 {
					return nil, errors.New(ErrorDidNotCheckout)
				}
				state.Quantity = v.Quantity - 1
				if v.Quantity-1 == 0 {
					state.CheckedOut = false
					state.Returned = true
					state.ReturnDate = time.Now().Local().String()
				} else {
					// Only set if all quantity are returned
					state.CheckedOut = true
					state.Returned = false
				}
				state.User = uid
				states = append(states[0:i], states[i+1:]...)
				break
			}
		}
		u.States = append(states, state)
	}

	u.Author = currentBook.Author
	u.Description = currentBook.Description
	u.IBSN = currentBook.IBSN
	u.Title = currentBook.Title
	u.UpdatedAt = time.Now().Local().String()
	u.Inventory = currentBook.Inventory + 1

	// Save Book
	av, err := dynamodbattribute.MarshalMap(u)
	if err != nil {
		return nil, errors.New(ErrorCouldNotMarshalItem)
	}

	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String(bookTable),
	}

	_, err = dynaClient.PutItem(input)
	if err != nil {
		return nil, errors.New(ErrorCouldNotDynamoPutItem)
	}
	return &u, nil
}
