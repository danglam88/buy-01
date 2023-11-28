# Java Buy-01 Project

## Table of Contents
- [Description](#description)
- [Front-end Specifications](#front-end-specifications)
- [Back-end Specifications](#back-end-specifications)
- [CI/CD Pipeline (using Jenkins)](#cicd-pipeline-using-jenkins)
- [Dashboard URLs](#dashboard-urls)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Contributing](#contributing)
- [Authors](#authors)

## Description

This is a Java project that develops and end-to-end e-commerce platform with Spring Boot microservices and Angular. The platplorms supports user registration (either as a client or a seller), authentication, product CRUD functionality exclusively for sellers, and media management for product images.

* Role-based functionalities: A user can either register as a Seller or a Client.
- Seller: Can access the home page with product listings view. Sellers have the ability to create products and manage their products. They also have the ability to view and update their own profile.
- Client: Can access the home page with product listings view. They have the ability to view and update their own profile.

## Front-end Specifications

- Sign-In/ Up Pages: `/login` and `/register` - Authentication views. 
- Homepage `/home` - Once a user is authenticated, he/she will be directed to homepage. A simple view to display all products. 
- Seller Product Management `/product-dashboard` - If a user is authenticated as seller, he/she will be able to create products and manage their products.
- User Profile `/user-dashboard` - Users can view and update their information.

## Back-end Specifications

The list of REST APIs to perform CRUD operations on Users (https://164.92.252.125:8443), Products (https://164.92.252.125:8444) and Media (https://164.92.252.125:8445) are:

- POST `/auth` - Authenticate a user by their username (email) and password then return a 7-day valid token to them (accessible without authentication)
- POST `/reg` - Register a new user as a seller or a client (accessible without authentication)

- GET `/users/userInfo` - Get the information (excepts for avatar) of the currently authenticated user (accessible by a seller or a client)
- GET `/users/{id}` - Get the information (excepts for avatar) of the currently authenticated user if they have the same ID as the given ID (accessible by a seller or a client)
- GET `/users/avatar/{id}` - Get the avatar image of the currently authenticated user (accessible by a seller or a client)
- PUT `/users/{id}` - Update the currently authenticated user if they have the same ID as the given ID (accessible by a seller or a client)
- DELETE `/users/{id}` - Delete the currently authenticated user if they have the same ID as the given ID (accessible by a seller or a client)

- GET `/products` - Get all products information from the database (accessible by a seller or a client)
- GET `/products/{id}` - Get information of a product by its ID (accessible by a seller or a client)
- GET `/products/seller` - Get all products information owned by the currently authenticated user who is a seller (accessible by a seller only)
- POST `/products` - Create a new product with all of its information (including its media, accessible by a seller only)
- PUT `/products/{id}` - Update information of a product by its ID if the currently authenticated user owns it and is a seller (accessible by a seller only)
- DELETE `/products/{id}` - Delete a product by its ID if the currently authenticated user owns it and is a seller (accessible by a seller only)

- GET `/media/product/{id}` - Get all media information of a product with the given ID (accessible by a seller or a client)
- GET `/media/{id}` - Get information of a media by its ID (accessible by a seller or a client)
- POST `/media` - Create a new media with its data and ID of the product it belongs to (accessible by a seller only)
- DELETE `/media/{id}` - Delete a media by its ID if the currently authenticated user owns it and is a seller (accessible by a seller only)

An example of a valid JSON object for authenticating a user is:

```json
{
    "username": "abcxyz@gmail.com",
    "password": "123456"
}
```

An example of a valid JSON object for registering a new user is:

```json
{
    "name": "Name of User",
    "email": "abcxyz@gmail.com",
    "password": "123456",
    "role": "SELLER"
}
```

An example of a valid form-data object for creating a new product is:

```form-data
{
    "name": "Name of Product",
    "description": "Description of Product",
    "price": 100.0,
    "quantity": 5,
    "files": <list_of_valid_media_images>
}
```

An example of a valid form-data object for creating a new user is:

```form-data
{
    "name": "Name of User",
    "email": "abcxyz@gmail.com",
    "password": "123456",
    "role": "SELLER",
    "file": <valid_avatar_image> (not required)
}
```

## Endpoints for buy-02

### For items in the cart:

### POST  `/order/item` 
 for add item to cart from product listing page or other pages with json body:
 ```json
{
    "productId": "XXX",
    "quantity": 1
}
```

and response :
 - HTTP STATUS 400 
 ```json
{
  "message": "Decrease quantity",
}
```
- HTTP STATUS 201 with empty body

### PUT  `/order/item/{itemID}` 
 for update quantity in a cart page with body 
  ```json
{
    "quantity": 1
}
```
 and response:
- HTTP STATUS 200 with empty body
- HTTP STATUS 400
 ```json
{
  "message": "Decrease quantity"
}
```

### DELETE  `/order/item/{itemID}` 
with empty body for delete item in a cart page and response:
- HTTP STATUS 200 with empty body


### GET  `/order/item/`
for getting current cart items for cart page with empty body and response :
 ```json
[
   {
      "item_id": "XXX",
      "product" : {
         "product_id" : "XXX",
        "name": "Name of Product",
        "description": "Description of Product",
        "price": 100.0,
        "quantity": 5
      },
      "quantity" : 3,
      "item_price" : "XXXX"
   }
]
```

### For orders:

### POST  `/order`
for create an order with json body:
 ```json
{   
    "payment_code": "CASH"
}
```

and response:
- HTTP STATUS 400 with body:
 ```json
{
  "message": "Invalid payment code"
}
```
- HTTP STATUS 200 with body:
 ```json
{
  "order_id": "XXX"
}
```

### PUT  `/order/{order_id}`
for update order info (with the same body as for POST and the same response scenarios)

### DELETE  `/order/{order_id}`
for delete order (in order history in remove scenario for client) with response:
- HTTP STATUS 200 with empty body

## GET `/order/{order_id}`
info about the order with no request body and response body:
 ```json
{
   "order_id" : "XXX",
   "status_code" : "CREATED",
   "items" : [
      {
         "item_id": "XXX",
         "product" : {
            "product_id" : "XXX",
            "name": "Name of Product",
            "description": "Description of Product",
            "price": 100.0,
            "quantity": 5
         },
         "quantity" : 3,
         "item_price" : "XXXX"
      }
   ],
   "payment_code": "CASH"
}
```

## GET `/order/seller` and GET `/order/client`
info about seller's orders for seller and client order history for client with no request body and response body:
 ```json
[
   {
      "order_id" : "XXX",
      "status_code" : "CREATED",
      "items" : [
         {
            "item_id": "XXX",
            "product" : {
               "product_id" : "XXX",
               "name": "Name of Product",
               "description": "Description of Product",
               "price": 100.0,
               "quantity": 5
            },
            "quantity" : 3,
            "item_price" : "XXXX"
         }
      ],
      "payment_code": "CASH"
   }
]
```


### Order Microservice database:

Table Order Item:
 - Buyer Id
 - Seller Id
 - Item Id
- Order id
- Product Id
- Quantity
- Item Price (Quantity * Product Price)

Table Order :
- Buyer ID
- Order ID
- Status Code (enum, see below)
- Payment Method Code (enum of method, let’s start from cash only)

Order Status codes:
- 1 Created
- 2 Delivered
- 3 Cancelled

Additional check (1):
When user removes an order, status must be 3
When user cancel - 1
When user redo - any status


Additional check (2):
When user adds to cart and removes from - increase and decrease quantity from product table

User actions from listing to create order
1 Add to cart from listing
2 Go to cart page (with info about cart items)
3 Go to order page (with info about payment method and delivery info)
4 Go to created order page info (with items, order info and order status)

## CI/CD Pipeline (using Jenkins)

The whole process of the project has been automated using Jenkins. The process consists of the following stages:

-  Source Code Management (SCM): source code of the project is cloned and checked out to the build-server (at 139.59.159.95).
-  Setup Credentials: all MongoDB credentials and JWT secret are set to Jenkinsfile environment variables and are accessible in different stages of the pipeline.
-  Clean Workspace: all old quality-check report-tasks are removed from the workspace.
-  SonarQube Analysis: this stage is performed for each and every backend microservice as well as frontend.
   +  If any of the analyses has been failed, the Post Actions stage will be triggered (Quality Gate, Frontend Unit Tests, Build and Deploy stages will be marked as failed in this case).
-  Quality Gate: this stage is performed for each and every backend microservice as well as frontend.
   +  If any of the quality-gates has been failed, the Post Actions stage will be triggered (Frontend Unit Tests, Build and Deploy stages will be marked as failed in this case).
-  Frontend Unit Tests: the unit-tests for frontend are performed at the build-server.
   +  If any of the unit-tests has been failed, the Post Actions stage will be triggered (Build and Deploy stages will be marked as failed in this case).
-  Build: once all the unit-tests have been passed, the builds will be performed for both frontend and backend microservices (producing Docker images) at the build-server.
   +  If all the builds are passed, the produced Docker images will then be pushed to a Docker Hub and are ready to be deployed.
   +  If any of the builds has been failed, the Post Actions stage will be triggered (the Deploy stage will be marked as failed in this case).
-  Deploy: once all the frontend and backend Docker images are available in the Docker Hub, they will be pulled to the deploy-server (at 164.92.252.125) and the deployment starts.
   +  Other necessary Docker images such as Zookeeper, Kafka and MongoDB are also pulled to the deploy-server.
   +  A separate Docker container is configured for each of the Docker images.
   +  If the deployment is passed, all the Docker containers are started and all the Docker images for frontend and backend are saved into a backup directory on the deploy-server. 
   +  Rollback: If the deployment is failed, all the Docker containers are stopped and removed. All the Docker images for frontend and backend are also removed and the latest successful Docker images are fetched from the backup directory on the deploy-server. All the Docker containers are started with those latest successful Docker images. 
-  Post Actions:
   +  Email Notifications: If deployment is passed, a success email will also be sent to all the team members. If the pipeline failed at any stage, the following stages will be skipped and a failure email will also be sent to all the team members as well as the ones whose commits broke the pipeline.

## Dashboard URLs

Jenkins: http://164.90.178.137:8080

SonarQube Server: http://209.38.204.141:9000

Application: https://164.92.252.125:4200

## Installation

To install the project, clone the repository to your local machine.

```bash
git clone git@github.com:danglam88/buy-01.git
```

## Usage

To run the project, navigate to the project root directory, make some changes, then push them to the main branch of the project repository. The CI/CD pipeline will be triggered (using Webhooks in Github) after that. Finally, the application is accessible at https://164.92.252.125:4200 after the pipeline process has been completed.

Postman is a great tool for testing REST APIs. You can download it [here](https://www.postman.com/downloads/).

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request if you would like to help improving the project.

## Authors

- [Danglam](https://github.com/danglam88)
- [Ashley](https://github.com/hgwtra)
- [Iuliia](https://github.com/ManWhoSoldTheW0rld)
- [Nafi](https://github.com/NafiRanta)
