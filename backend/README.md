Here are Julia's and Dang's suggested APIs and Kafka Topics for our project:

APIs (user type):
-  GET: /users/userInfo => own client, own seller
   +  PASS: 200 OK with user object (without password)
   +  FAIL: 404 NOT FOUND with empty body
-  GET: /users/{user_id} => own client, own seller
   +  PASS: 200 OK with user object (without password)
   +  FAIL: 404 NOT FOUND with empty body
-  GET: /products/seller => seller's products list
    +  PASS: 200 OK with list of objects (product with images)
    +  FAIL: 403 with empty body
-  GET: /products/{product_id} => own seller
   +  PASS: 200 OK with product (product with images)
   +  FAIL: 403 with empty body
-  GET: /media/product/{product_id} => images of the product (only for backend, for the frontend data in the product object)
   +  PASS: 200 OK with media
   +  FAIL: 403 with empty body
-  GET: /media/{media_id} => own seller of corresponding product
   +  PASS: 200 OK with media
   +  FAIL: 403 with empty body
-  POST: /reg => unauthenticated
   +  PASS: 201 CREATED with endpoint to new user in header location
   +  FAIL: 400 BAD REQUEST with error object
-  POST: /auth => unauthenticated
   +  PASS: 200 OK with token object
   +  FAIL: 400 BAD REQUEST with error object
   +  FAIL: 401 UNAUTHORIZED with empty body
-  POST: /products => seller
   +  PASS: 200 OK with token object
   +  FAIL: 400 BAD REQUEST with error object
   +  FAIL: 401 UNAUTHORIZED with empty body
-  POST: /media => own seller of corresponding product (only for backend, for the frontend via product form)
-  PUT: /users/{user_id} => own client, own seller
   +  PASS: 200 OK with endpoint to updated user in header location
   +  FAIL: 404 NOT FOUND with empty body
   +  FAIL: 400 BAD REQUEST with error object
-  PUT: /products/{product_id} => own seller
-  PUT: /media/{media_id} => own seller of corresponding product
-  DELETE: /users/{user_id} => own client, own seller (optional)
   +  PASS: 200 OK with empty body
   +  FAIL: 404 NOT FOUND with empty body
-  DELETE: /products/{product_id} => own seller
-  DELETE: /media/{media_id} => own seller of corresponding product
-  DELETE: /media => own seller of corresponding product

HTTP Status Codes:
-  204 NO CONTENT: successful response for GET request for empty lists
-  201 CREATED: successful response for POST (/reg) request (endpoint to new item in header location)
-  200 OK: successful response for GET and PUT requests (endpoint to updated item in header location)
-  200 OK: successful response for POST (/auth) and DELETE requests
   +  Token object in response: { "token": "token_string", "role": "role_string" }
-  400 BAD REQUEST: invalid JSON format in POST and PUT requests
   +  Error object in response: { "field_name_1": "error_message_1", "field_name_2": "error_message_2", ... }
-  404 NOT FOUND: unfounded object in GET, PUT, and DELETE requests
-  401 UNAUTHORIZED: invalid credentials in all requests excepts for POST (/reg and /auth) requests
-  403 FORBIDDEN: all other unhandled exceptions

Kafka Topics (Producer -> Consumer):
-  "DELETE_USER": User -> Product
-  "DELETE_PRODUCT": Product -> Media

Asynchronous Requests:
-  "GET_USER_BY_INFO" (userId or email): Product -> User
-  "CHECK_PRODUCT_BY_ID" (checking if authorized seller has rights to manipulate media): Product -> Media

Please discuss if this is the right way to go, and please adjust if you find something unreasonable. If something is still unclear, please feel free to ask.
