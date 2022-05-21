echo Setting Vars...
set GOARCH=amd64
set GOOS=linux
echo Building...

@REM Add all the lambdas below to build binaries 
go build -o build/user lambdas/user.go
go build -o build/book lambdas/book.go
go build -o build/book_actions lambdas/book_actions.go
go build -o build/authorizer lambdas/authorizer.go

@REM echo Deploying...
@REM serverless deploy

pause