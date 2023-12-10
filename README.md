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

This is a Java project that develops and end-to-end e-commerce platform with Spring Boot microservices and Angular. The platplorms supports user registration (either as a client or a seller), authentication, product CRUD functionality exclusively for sellers, order and order item CRUD functionality for sellers and clients, and media management for product images.

* Role-based functionalities: A user can either register as a Seller or a Client.
- Seller: Can access the home page with product listings view. Sellers have the ability to create products, manage their products, confirm/cancel order items for their own product. They also have the ability to view and update their own profile.
- Client: Can access the home page with product listings view. Clients have the ability to add order items to their own cart, create orders and cancel their own orders. They also have the ability to view and update their own profile.

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

### Endpoints for order-microservice

The list of REST APIs to perform CRUD operations on Order (https://164.92.252.125:8446) are:

- GET `/order/item` - Get all order items in the current cart of the logged-in client (accessible by a client only)

   + Response:

      ```json
      [
         {
            "itemId": "XYZ",
            "product": {
               "id": "ABC",
               "name": "iPhone",
               "description": "iPhone",
               "price": 10.0,
               "quantity": 80
            },
            "quantity": 5,
            "itemPrice": 50.0
         }
      ]
      ```

- POST `/order/item` - Add a new order item to the current cart of the logged-in client (accessible by a client only)

   + Request:

      ```json
      {
         "productId": "ABC",
         "quantity": 5
      }
      ```

   + Response: itemId as a string

- POST `/order/item/redo` - Redo a confirmed order item by adding it to the current cart of the logged-in client (accessible by a client only)

   + Request:

      ```json
      {
         "itemId": "XYZ",
         "orderId": "VSL",
         "productId": "ABC",
         "quantity": 5
      }
      ```

   + Response: itemId as a string

- PUT `/order/item/{id}` - Update quantity for an existing order item in the current cart of the logged-in client (accessible by a client only)

   + Request:

      ```json
      {
         "productId": "ABC",
         "quantity": 10
      }
      ```

- PUT `/order/item/status/{id}` - Confirm/Cancel an order item of a client as a logged-in seller of the product for that order item (accessible by a seller only)

   + Request:

      ```json
      {
         "productId": "ABC",
         "statusCode": "CONFIRMED",
         "orderId": "RST"
      }
      ```

- PUT `/order/item/cancel/{id}` - Cancel an order item as a logged-in client who owns that order item (accessible by a client only)

   + Request:

      ```json
      {
         "productId": "ABC",
         "statusCode": "CANCELLED",
         "orderId": "RST"
      }
      ```

- DELETE `/order/item/{id}` - Delete an order item in the current cart of the logged-in client or an order item that has been cancelled by a seller before (accessible by a client only)

- GET `/order/seller` - Get all order items for the products of the logged-in seller as well as his most-selling products and total money earned (accessible by a seller only)

   + Response:

      ```json
      {
         "items": [
            {
               "order_id": "XUV",
               "item_id": "GHI",
               "product_id": "RFB",
               "name": "MAC Book",
               "description": "MAC Book",
               "quantity": 2,
               "item_price": 3500.0,
               "status_code": "CONFIRMED"
            },
            {
               "order_id": "UJC",
               "item_id": "YHN",
               "product_id": "QAZ",
               "name": "iPad",
               "description": "iPad",
               "quantity": 3,
               "item_price": 2500.0,
               "status_code": "CANCELLED"
            }
         ],
         "top_products": [
            {
               "product_id": "RFB",
               "name": "MAC Book",
               "total_quantity": 2
            }
         ],
         "total_amount": 7000.0
      }
      ```

- GET `/order/client` - Get all orders of the logged-in client as well as his most-buying products and total money spent (accessible by a client only)

   + Response:

      ```json
      {
         "orders": [
            {
               "order_id": "XUV",
               "status_code": "CONFIRMED",
               "items": [
                  {
                     "order_id": "XUV",
                     "item_id": "GHI",
                     "product_id": "RFB",
                     "name": "MAC Book",
                     "description": "MAC Book",
                     "quantity": 2,
                     "item_price": 3500.0,
                     "status_code": "CONFIRMED"
                  }
               ],
               "payment_code": "CASH"
            },
            {
               "order_id": "UJC",
               "status_code": "CANCELLED",
               "items": [
                  {
                     "order_id": "UJC",
                     "item_id": "YHN",
                     "product_id": "QAZ",
                     "name": "iPad",
                     "description": "iPad",
                     "quantity": 3,
                     "item_price": 2500.0,
                     "status_code": "CANCELLED"
                  }
               ],
               "payment_code": "CASH"
            }
         ],
         "top_products": [
            {
               "product_id": "RFB",
               "name": "MAC Book",
               "total_quantity": 2
            }
         ],
         "total_amount": 7000.0
      }
      ```

- GET `/order/{id}` - Get an order (with all order items inside) of the logged-in client (accessible by a client only)

   + Response:

      ```json
      {
         "order_id": "UJC",
         "status_code": "CANCELLED",
         "items": [
            {
               "order_id": "UJC",
               "item_id": "YHN",
               "product_id": "QAZ",
               "name": "iPad",
               "description": "iPad",
               "quantity": 3,
               "item_price": 2500.0,
               "status_code": "CANCELLED"
            }
         ],
         "payment_code": "CASH"
      }
      ```

- POST `/order` - Create a new order with all order items in the current cart of the logged-in client (accessible by a client only)

   + Request:

      ```json
      {
         "order_status": "CREATED",
         "payment_code": "CASH"
      }
      ```

   + Response: orderId as a string

- PUT `/order/{id}` - Cancel an order or confirm an order (with at lease one order item confirmed) as a logged-in client who owns that order (accessible by a client only)

   + Request:

      ```json
      {
         "order_status": "CANCELLED",
         "payment_code": "CASH"
      }
      ```

- DELETE `/order/{id}` - Delete an order (and all its order items) that has been cancelled before as a logged-in client who owns that order (accessible by a client only)

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
