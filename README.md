# Library Management System

This repo contains a serverless REST API and frontend to manage library books.

**⚠️ This project is under development and is not fully functional.**

## Technology Stack

### Main Technolgies

- Backend: [Go/Golang](https://go.dev/)
- Frontend: [React.js](https://reactjs.org/)

### Deployment/Hosting

- [AWS](https://aws.amazon.com/)
  - [AWS Lambda](https://aws.amazon.com/lambda/)
  - [AWS API Gateway](https://aws.amazon.com/api-gateway/)
  - [AWS DynamDB](https://aws.amazon.com/dynamodb/)

### CI/CD

- Infrastructure: [Serverless Framework](https://www.serverless.com/)
- [GitHub Actions](https://github.com/features/actions)
  - See the workflow for this repo [here](https://github.com/CarterCobb/library-PT/blob/main/.github/workflows/main.yml)

## Requirements

Using whichever language(s)/stack that is best suited, create a library management system per the requirements below. Please submit your code via a publicly available repository.

- API for CRUD of a books, managing title, author, isbn, description
- Ability to manage books through a web interface
- Ability to check in and check out a book
- Ability to track state changes for a book
- Report that contains the current state of all books

## Build/Run

### Local Building and Deployment

- Run the `build.bat` file found [here](https://github.com/CarterCobb/library-PT/blob/main/build.bat)

### GitHub Actions

The project is re-deployed to AWS through a GitHub Action. Worflow found [here](https://github.com/CarterCobb/library-PT/blob/main/.github/workflows/main.yml) That action is triggered by a push to the `main` branch. Please note that this only works for the code [owner](https://github.com/CarterCobb)'s repo