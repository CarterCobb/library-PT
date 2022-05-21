echo Setting Vars...
set GOARCH=amd64
set GOOS=linux
echo Building...

@REM Add all the lambdas below to build binaries 
go build -o build/user lambdas/main.go
go build -o build/book lambdas/main.go
go build -o build/book_actions lambdas/main.go
go build -o build/authorizer lambdas/main.go

@REM echo Deploying...
@REM serverless deploy

pause