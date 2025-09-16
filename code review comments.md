# Review comments (WIP)

1. change "dev" to use only nodemon instead of using full path.
2. convert to ESM mode , hence added ts extensions to files
3. in the readme, change 'npm start' to 'npm run dev' for frontend
4. Add steps to register and login
5. not mobile friendly , unable to send type messages in the inbox
6. application still buggy got messages twice in public chat
7. Limit maximum size of request body.
8. Response status codes and error messages can be kept in separate file as constants and imported
9. Put rate limit in some constants file so it is easy to change.
10. Rate limit info could be persisted to Redis.