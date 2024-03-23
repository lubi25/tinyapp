# TinyApp: URL Shortener

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). It provides authentication protection and enables users to perform CRUD (Create, Read, Update, Delete) operations on their shortened URLs. The application is built to react to the user's logged-in state.

## Features

- **Authentication Protection**: Users must log in to access certain pages and perform CRUD operations.
- **User Authentication**: Users can register for an account and log in securely.
- **URL Shortening**: Convert long URLs into short, easy-to-share links.
- **CRUD Operations**: Users can Create, Read, Update, and Delete their shortened URLs.
- **Multipage Application**: The application consists of multiple pages to provide a seamless user experience.

## Final Product
!["Screenshot of main page"](/docs/_0000_welcome.png)
!["Screenshot of registration page"](/docs/_0001_register.png)
!["Screenshot of URL creation page"](/docs/_0002_create-new-url.png)
!["Screenshot of new URL page"](/docs/_0003_new-url.png)
!["Screenshot of your URL page"](/docs/_0004_my-urls.png)

## Getting Started

Follow these steps to get TinyApp up and running on your local machine:

1. Clone the repository:
```git clone https://github.com/lubi25/tinyapp.git```

2. Dependencies:
- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

3. Install dependencies:
```npm install```

3. Start the application:
```npm start```

4. Open your web browser and navigate to `http://localhost:8080` to access TinyApp.

## Usage

- **Register**: Create a new account by providing your details (e.g.email, password).
- **Login**: Log in to your account with your username/email and password.
- **Shorten URLs**: Paste a long URL into the input field and click "Submit" to generate a shortened URL.
- **View Shortened URLs**: See a list of all shortened URLs associated with your account under 'My URLs'.
- **Update**: Edit existing shortened URLs to update their destination.
- **Delete**: Remove unwanted shortened URLs.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
