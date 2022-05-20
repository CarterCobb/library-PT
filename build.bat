echo Setting Vars...
set GOARCH=amd64
set GOOS=linux
echo Building...

@REM Add all the lambdas below to build binaries 
go build -o build/book lambdas/book.go

echo Deploying...
serverless deploy

pause