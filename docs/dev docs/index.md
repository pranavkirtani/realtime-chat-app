# Developer Document

# Real-Time Chat Application

A full-stack real-time chat application built with React, Node.js, Express, TypeScript, and WebSockets.


Do have a look at the [sequence diagram](../user%20docs/index.md) to get a better understanding of the workflow and events.

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
   
   b. **Message Service** - Manages messages for users. Handles fetching of messages, updates user inboxes, updates message delivery status, gets conversation history, and retrieves the unread message count.  
   
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
   1. **AuthContext**- Stores ,retrieves and deletes tokens from local storage, sets and deletes users from the state.
   2. **ChatContext** - Listens to various events relevant to the chat portion of the application and handles then appropriately.Helps fetch conversations and messages.
4. **Components** - Reusable building blocks of the user interface.In our app this includes ``Chat``,``MessageList``,``ConnectionStatus``,``MessageInput``,``MessageItem`` and ``UserList``.
5. **Services** - Help make calls to backend services, store tokens in local storage, and handle socket events (emit/listen).  
   1. **Socket service**: Handles all the events on the front end. Is called by others to emit events.
   2. **Api service**:Is the service that primarily interacts with the backend layer via http calls.

6. **Styles**: Contains the css for each of the components in the front end.
7. **Assets**:Contains the static assets (like logos and images) for the app.
8. **Types**: Describes the interfaces and enums being used.
## Swagger

``` cd backend ```

``` npm run dev ```

and then hit

[http://localhost:3001/api/docs](http://localhost:3001/api/docs)


## Things to improve
1. Pages are not responsive, we need to make them responsive.
2. In the front end the api service is storing and fetching tokens too, perhaps this is best given to a different service.
3. Error response codes could be placed as constants in other another file.
```
        export const HTTP_STATUS = {
            OK: 200,
            CREATED: 201,
            BAD_REQUEST: 400,
            UNAUTHORIZED: 401,
            FORBIDDEN: 403,
            NOT_FOUND: 404,
            INTERNAL_SERVER_ERROR: 500,
};
```
4. Similar comment for rate limit too, perhaps we have them as constants in a single file which is easy tp update.
5. We would want to rate limit health too to avoid denial of service attack on health api.
6. Code coverage is low add more tests.
7. Add logging (eg: Winston)
8. I see a lot of magic numbers being used, perhaps better to have them in common file for better tracking and updates.

### Scalability and High availability

1. As the application will scale with more users, it wont be possible to manage all users in memory. Better to use a Database.This could help both in managing users as well as message history.
2. Currently a single server is maintaining the list of socket connections. This wont scale, perhaps Redis pub sub integration.


### Security

1. Use TLS on the server.
2. Use distroless images instead of alpine for lower attack surface.
3. Store Refresh token in http-only cookies (not localstorage). This will need modification to the refresh endpoint to read cookies.


### Future enhancement

1. Perhaps we move away from password based login. Allow user to login via their phone by scanning QR codes.



[Main Page](../../README.md)