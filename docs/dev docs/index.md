# Developer document

# Real-Time Chat Application

A full-stack real-time chat application built with React, Node.js,Express, TypeScript, and WebSockets.

## Backend Components

1. ```index.ts```- The entrypoint for the Node.js backend.This file creates the http server and registers the app.

2. ```app.ts``` - Contains all the middleware of our application. Every request passes through the app file and is taken to the appropriate middleware function. 
Middleware for our application includes:

    a. [Helmet](https://www.npmjs.com/package/helmet)- Used for securing the application from a wide variety of attacks by setting appropriate headers. The list  is mentioned [here](https://www.npmjs.com/package/helmet) for reference.

    b. [CORS](https://github.com/expressjs/cors#readme)- Enables CORS for the origin of the front end (i.e. domain name) defaults to localhost if domain name not provided.

    c. [Express] (https://expressjs.com/en/api.html) - The main package on which our application is built. Provides host of functionalities from routing to body parsing.

    d. [Dotenv] (https://www.npmjs.com/package/dotenv): - Loads environment variables from a .env file into process.env.
    
    app.ts also includes custom middleware for errorhandling,rate limiting, ,health checks,custom routes etc.

3. ``app.routes``-  This file contains all the important routes of our express application.
4. **Custom Middleware**- under the ```middleware``` folder, we find the various types of middleware used by our application.
 
   a. **Auth middleware**:- Checks for the ```Bearer``` token  in the request's **authorization** header, verifies the token and uses it to identify userID else returns appropriate error response.

   b. **Rate limiter**- Helps set rate limit for messages,api and authentication attempts. This is to protect server from denial of service attacks. Uses [express-rate-imit](https://www.npmjs.com/package/express-rate-limit)
   
   c. **Error Handler**- Used for error handling in our application. Some errors from previous layers are also passed down to this layer.

   d. **Validation**- Uses [Joi](https://joi.dev/api/?v=17.13.3) to validate requests sent to the server.


5. **Types** - Describes the structure of various data objects in used by our systems (Message,TokenPayload) as well as some enums (DeliveryStatus) and some [DTOs(Data transfer objects)](https://en.wikipedia.org/wiki/Data_transfer_object)
6. **Socket** - Has a socket handler class that performs different functionality based on the types of events the systems recieves.Also includes functionality for verifying tokens and checking of ratelimit is exceeded.
7. **Controllers**- Has the controller logic for register,login,refresh and me functionality. it talks to services layers and sends error response incase of exceptions.
8. **Services**- Contains the follwoing services:
9. 
   a. User service- Helps create ,find and update a list of users in memory.

   b. Message Service- Manages messages for users. Handles creation of message,updates user's inbox,update message delivery status, get conversation history and get unread message count.

   c. Auth service- generates , validates JWT tokens and generates refresh tokens. Interacts with suer service to help with login and registration of users.

10. **Utils**: currently has only validation utils that uses [Joi](https://joi.dev/api/?v=17.13.3) to perform validations on the fields passed for login , registration and messages.



### Coverage

1. To run coverage run ```npm test``` in the backend folder. Can see detailed report in coverage folder.

## Frontend Components

1. ```main.tsx```- The starting point of the react application.
2. ``` app.tsx```- The main part of our app with different components of our React app.
3. **Context** - To help pass values across components. We use AuthContext and ChatContext currently.
4. **Components** - A reusable building block of the user interface.
5. **Services** - These help in  making calls to backend service,storing tokens in localstorage.emitting and handling events