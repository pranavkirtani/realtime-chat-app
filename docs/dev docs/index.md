# Developer Document

# Real-Time Chat Application

A full-stack real-time chat application built with React, Node.js, Express, TypeScript, and WebSockets.

## Backend Components

1. ```index.ts``` - The entry point for the Node.js backend. This file creates the HTTP server and registers the app.

2. ```app.ts``` - Contains all the middleware of our application. Every request passes through the app file and is taken to the appropriate middleware function.  
   Middleware for our application includes:

   a. [Helmet](https://www.npmjs.com/package/helmet) - Used for securing the application from a wide variety of attacks by setting appropriate headers. The list is mentioned [here](https://www.npmjs.com/package/helmet) for reference.

   b. [CORS](https://github.com/expressjs/cors#readme) - Enables CORS for the origin of the front end (i.e. domain name). Defaults to localhost if a domain name is not provided.

   c. [Express](https://expressjs.com/en/api.html) - The main package on which our application is built. Provides a host of functionalities from routing to body parsing.

   d. [Dotenv](https://www.npmjs.com/package/dotenv) - Loads environment variables from a `.env` file into `process.env`.
    
   `app.ts` also includes custom middleware for error handling, rate limiting, health checks, custom routes, etc.

3. ```app.routes``` - This file contains all the important routes of our Express application.

4. **Custom Middleware** - Under the ```middleware``` folder, we find the various types of middleware used by our application:
 
   a. **Auth middleware** - Checks for the ```Bearer``` token in the request's **authorization** header, verifies the token, and uses it to identify the user ID. Otherwise, it returns an appropriate error response.

   b. **Rate limiter** - Helps set a rate limit for messages, APIs, and authentication attempts. This protects the server from denial-of-service attacks. Uses [express-rate-limit](https://www.npmjs.com/package/express-rate-limit).
   
   c. **Error Handler** - Handles errors in our application. Some errors from previous layers are also passed down to this layer.

   d. **Validation** - Uses [Joi](https://joi.dev/api/?v=17.13.3) to validate requests sent to the server.

5. **Types** - Describes the structure of various data objects used by our system (`Message`, `TokenPayload`) as well as some enums (`DeliveryStatus`) and [DTOs (Data Transfer Objects)](https://en.wikipedia.org/wiki/Data_transfer_object).

6. **Socket** - Contains a socket handler class that performs different functionality based on the types of events the system receives. Also includes functionality for verifying tokens and checking if the rate limit is exceeded.

7. **Controllers** - Contains the controller logic for register, login, refresh, and me functionality. It talks to service layers and sends error responses in case of exceptions.

8. **Services** - Contains the following services:
   
   a. **User Service** - Helps create, find, and update a list of users in memory.  
   
   b. **Message Service** - Manages messages for users. Handles creation of messages, updates user inboxes, updates message delivery status, gets conversation history, and retrieves the unread message count.  
   
   c. **Auth Service** - Generates and validates JWT tokens and generates refresh tokens. Interacts with the user service to handle login and registration of users.

9. **Utils** - Currently has only validation utils that use [Joi](https://joi.dev/api/?v=17.13.3) to perform validations on the fields passed for login, registration, and messages.

---

### Coverage

1. To run coverage, run ```npm test``` in the backend folder. A detailed report can be found in the `coverage` folder.

---

## Frontend Components

1. ```main.tsx``` - The starting point of the React application.
2. ```app.tsx``` - The main part of our app with different components of our React app.
3. **Context** - Helps pass values across components. We currently use `AuthContext` and `ChatContext`.
4. **Components** - Reusable building blocks of the user interface.
5. **Services** - Help make calls to backend services, store tokens in local storage, and handle socket events (emit/listen).  
