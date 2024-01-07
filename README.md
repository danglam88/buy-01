# Java Buy-01 Project

## Table of Contents
- [Description](#description)
- [Front-end Specifications](#front-end-specifications)
- [Back-end Specifications](#back-end-specifications)
- [CI/CD Pipeline (using Jenkins)](#cicd-pipeline-using-jenkins)
- [Artifact Management (using Nexus)](#artifact-management-using-nexus)
- [Dashboard URLs](#dashboard-urls)
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
- My Orders `/my-orders` - Sellers and users can use this page to view, manage, and check the status and history of their orders. Sellers can confirm or cancel their requested orders, while users can cancel, view, and redo their successful orders.
- Cart `/cart` - Users have the ability to add products from the home page to their cart. In the cart, users can view the added products, their prices, change product quantities, and see the total price. Users can then choose home delivery and proceed to checkout. The cart is sent to sellers and awaits approval. During this pending process, users can cancel the order on the `/my-orders` page. Once the order is fulfilled, users cannot cancel their order anymore.

## Back-end Specifications

The list of REST APIs to perform CRUD operations on Users (https://164.92.252.125:8443), Products (https://164.92.252.125:8444) and Media (https://164.92.252.125:8445) are:

- POST `/auth` - Authenticate a user by their username (email) and password then return a 7-day valid token to them (accessible without authentication)
- POST `/reg` - Register a new user as a seller or a client (accessible without authentication)

- GET `/users/userInfo` - Get the information (excepts for avatar) of the currently authenticated user (accessible by a seller or a client)
- GET `/users/{id}` - Get the information (excepts for avatar) of a user with the given ID (accessible by a seller or a client)
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

- GET `/order/item/{id}` - Get an existing order item in the current cart of the logged-in client (accessible by a client only)

   + Response:

      ```json
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

- DELETE `/order/item/{id}` - Delete an order item in the current cart of the logged-in client (accessible by a client only)

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

- POST `/order/redo` - Redo a confirmed order by adding all its confirmed order items to the current cart of the logged-in client (accessible by a client only)

   + Request: orderId as a string

   + Response: itemIds as a list of strings

- PUT `/order/{id}` - Cancel an order as a logged-in client who owns that order (accessible by a client only)

   + Request:

      ```json
      {
         "order_status": "CANCELLED",
         "payment_code": "CASH"
      }
      ```

- DELETE `/order/{id}` - Delete an order that has been cancelled before as a logged-in client who owns that order (accessible by a client only)

## CI/CD Pipeline (using Jenkins)

The whole process of the project has been automated using Jenkins. The process consists of the following stages:

-  Source Code Management (SCM): source code of the project is cloned and checked out to the build-server (at 139.59.159.95).
-  Setup Environment Variables: all MongoDB credentials, Nexus credentials, JWT secret, NodeJS path and Docker images are set to Jenkinsfile environment variables and are accessible in different stages of the pipeline.
-  Clean Workspace: all old quality-check report-tasks are removed from the workspace.
-  SonarQube Analysis: this stage is performed for each and every backend microservice as well as frontend.
   +  If any of the analyses has been failed, the Post Actions stage will be triggered (Quality Gate, Frontend Unit Tests, Build and Deploy stages will be marked as failed in this case).
-  Quality Gate: this stage is performed for each and every backend microservice as well as frontend.
   +  If any of the quality-gates has been failed, the Post Actions stage will be triggered (Frontend Unit Tests, Build and Deploy stages will be marked as failed in this case).
-  Frontend Unit Tests: the unit-tests for frontend are performed at the build-server.
   +  If any of the unit-tests has been failed, the Post Actions stage will be triggered (Build and Deploy stages will be marked as failed in this case).
-  Deploy JAR and POM Artifacts to Nexus: once all the unit-tests have been passed, all the artifacts (JAR, POM, etc.) of each and every microservice as well as of the parent project will be pushed to a Nexus Maven Snapshot repository.
-  Build: once deploying of all the artifacts has been passed, the builds will be performed for both frontend and backend microservices (producing Docker images) at the build-server. All the dependencies of each and every microservice as well as of the parent project will be downloaded from a Nexus Maven Proxy repository.
   +  If all the builds are passed, the produced Docker images will then be tagged with the current build-number and pushed to a Nexus Docker repository and are ready to be deployed.
   +  If any of the builds has been failed, the Post Actions stage will be triggered (the Deploy stage will be marked as failed in this case).
-  Deploy: once all the frontend and backend Docker images are available in the Nexus Docker repository, they will be pulled to the deploy-server (at 164.92.252.125) and the deployment starts.
   +  Other necessary Docker images such as Zookeeper, Kafka and MongoDB are also pulled to the deploy-server.
   +  A separate Docker container is configured for each of the Docker images.
   +  If the deployment is passed, all the Docker containers are started and the current build-number is saved into the version_number file on the deploy-server.
   +  Rollback: If the deployment is failed, all the Docker containers are stopped and removed. All the Docker images for frontend and backend are also removed and the latest successful build-number is read from the version_number file on the deploy-server. All the latest successful Docker images (tagged with that latest successful build-number) are pulled from Nexus Docker repository and all the Docker containers are started with those latest successful Docker images.
-  Post Actions:
   +  Email Notifications: If deployment is passed, a success email will also be sent to all the team members. If the pipeline failed at any stage, the following stages will be skipped and a failure email will also be sent to all the team members as well as the ones whose commits broke the pipeline.

## Artifact Management (using Nexus)
-  Project Setup:
   1.  Copy the following files from the ``nexus`` directory under the ``buy-01`` project root folder to the nexus-server (at 209.38.204.141):
   - ``docker-compose.yml`` sets up a Nexus repository manager/ Nexus server using the specified image and provides essential configurations for its deployment.
   - ``Dockerfile`` is used to build a custom Docker image based on the official Sonatype Nexus 3 image (sonatype/nexus3). It switches to root user to create a directory at /nexus-blobs and sets the ownership to the user and group "nexus:nexus" This step is necessary for Nexus to have the appropriate permissions to manage and store artifacts in blobs store. After that, it switches back to the "nexus" user. This is the user that the Nexus service runs as for security reasons. Running the Nexus service as a non-root user enhances security by minimizing potential vulnerabilities.
   - ``setup.sh`` installs a Sonatype Nexus Repository server on the nexus-server at port 8081 by creating external volumes (if not already exist), building nexus-image using the above ``Dockerfile`` and running nexus-container using the above ``docker-compose.yml``.
   <pre>

   <img width="1440" alt="Screenshot 2024-01-07 at 0 19 12" src="https://github.com/danglam88/buy-01/assets/100776787/44b78d4d-9b15-4420-94de-b61c33ea6cfd">

   </pre>
   2.  Execute ``./setup.sh`` to install a Sonatype Nexus Repository server on the nexus-server at port 8081. Nexus is now accessible via http://209.38.204.141:8081
   <pre>

   <img width="1440" alt="Screenshot 2024-01-07 at 0 29 01" src="https://github.com/danglam88/buy-01/assets/100776787/6009b47e-0e52-4c2f-ba75-9002da68a16d">

   </pre>

-  Configuration Steps:
   -  Configure the build-server (at 139.59.159.95) and the deploy-server (at 164.92.252.125):
      1.  Create a ``daemon.json`` file under ``/etc/docker`` directory of build-server and deploy-server with the following content:
         ```json
         {
            "insecure-registries": ["209.38.204.141:8083"]
         }
         ```
      2.  Restart Docker on both build-server and deploy-server after the changes by the following command: ``sudo systemctl restart docker``
      3.  Create a file called ``settings.xml`` under the ``~/.m2`` directory on the build-server, put ``nexusUser`` to ``<username>`` and a pre-defined password (for e.g. ``nexusPassword``) to ``<password>`` as follows:
      <pre>

      <img width="990" alt="Screenshot 2024-01-07 at 0 44 38" src="https://github.com/danglam88/buy-01/assets/100776787/9793c40c-7170-4687-a162-689887dc32d0">
      
      </pre>
      4.  Run ``docker login 209.38.204.141:8083 -u nexusUser -p nexusPassword`` on both build-server and deploy-server.

   -  Configure Nexus Server:
      1.  Login to the installed Nexus server with credentials as ``admin/adminPassword`` (``adminPassword`` can be found at ``/nexus-data/admin.password`` within the nexus-container).
      2.  Follow on-screen instructions to change ``adminPassword`` to something really strong.
      - You can use a strong password generator like this: https://www.f-secure.com/en/password-generator
      3.  Disable allowing anonymous users to access the server by following on-screen instructions or by accessing in Sonatype Nexus Repository by navigating to ``Administration → Security → Anonymous Access``. Anonymous users won't be able to access Nexus instance and attempt to download components.
      <pre>

      <img width="990" alt="Screenshot+2023-04-12+at+11 34 09+AM" src="https://github.com/danglam88/buy-01/assets/100776787/d2c98b10-bdea-418c-9ab3-ba6c49c19701">

      </pre>
      4.  Create a ``Nexus Role`` named ``nx-docker`` with all Docker-related privileges. Follow the setups as shown in the below picture.
      <pre>

      <img width="1440" alt="Screenshot 2024-01-07 at 0 37 23" src="https://github.com/danglam88/buy-01/assets/100776787/d09d44bd-46d9-4f8e-8723-41287af72c7b">
      
      </pre>
      5.  Transfer the ``Docker Bearer Token Realm`` to the ``Active Realms``. Realms define a Sonatype Nexus Repository user's authentication source (e.g., ``Local Authentication``, ``LDAP Realm``, etc.). This realm is required to access Docker repositories through a Docker client or other container image manager (e.g., ``Docker Desktop``, ``Docker Engine``, ``Podman``, etc.).
      <pre>

      <img width="1440" alt="Screenshot 2024-01-07 at 0 38 06" src="https://github.com/danglam88/buy-01/assets/100776787/4593ab28-58c7-4311-bcc3-9992222bf66c">
      
      </pre>
      6.  Create an ``active user`` with credentials as ``nexusUser/nexusPassword`` (``nexusPassword`` can be found from ``settings.xml`` file under ``~/.m2`` directory on the build-server at 139.59.159.95). By configuring Nexus to operate under a dedicated "nexus" user enhances security by following the principle of least privilege, mitigating security risks, and providing isolation in case of vulnerabilities or attacks. It aligns with best practices for securing applications and is particularly important in containerized environments.
      <pre>

      <img width="1440" alt="Screenshot 2024-01-07 at 0 38 49" src="https://github.com/danglam88/buy-01/assets/100776787/8e83d155-cdc8-41a4-8e3d-e95b0c11b26a">

      </pre>
      7.  Create a ``docker-hosted`` repository named ``nx-docker`` at port ``8083``.
      <pre>

      <img width="1440" alt="Screenshot 2024-01-07 at 0 50 21" src="https://github.com/danglam88/buy-01/assets/100776787/ce2ab701-4795-4103-a28f-7648085b52a0">
      
      </pre>
      8.  Create a ``maven2-proxy`` repository named ``maven-proxy`` with ``permissive layout-policy``.
      <pre>

      <img width="1440" alt="Screenshot 2024-01-07 at 0 55 08" src="https://github.com/danglam88/buy-01/assets/100776787/258f624c-b1a6-453e-a069-efffe9da0a30">
      </pre>
      9.  Add ``maven-proxy`` repository to the list of ``member-repositories`` of ``maven-public`` group.
      <pre>

      <img width="1440" alt="Screenshot 2024-01-07 at 0 57 17" src="https://github.com/danglam88/buy-01/assets/100776787/aa312427-80f2-428f-a511-f3214f730729">

      </pre>

   -  Configure additional settings in the project:
      1.  Add to the ``pom.xml`` file of each and every microservice as well as of the parent project the following section (with ``${revision}`` resolved to the current pipeline build-number and ``${nexus.server.url}`` resolved to http://209.38.204.141:8081 in this case):
      ```xml
      ...
      <version>${revision}</version>
      ...
      <properties>
         ...
         <nexus.server.url>http://nexus-server-url</nexus.server.url>
         ...
      </properties>
      ...
      <distributionManagement>
         <snapshotRepository>
            <id>nexus-snapshots</id>
            <url>${nexus.server.url}/repository/maven-snapshots/</url>
         </snapshotRepository>
         <repository>
            <id>nexus-releases</id>
            <url>${nexus.server.url}/repository/maven-releases/</url>
         </repository>
      </distributionManagement>
      ...
      ```
      The above settings in the ``pom.xml`` files will be used for versioning of the ``JAR`` artifacts and pointing to the locations of ``mven-snapshots`` and ``maven-releases`` repositories on the nexus-server.

      2.  Create a file called ``settings.xml`` under the ``backend`` directory of the ``buy-01`` project root folder (with ``${NEXUS_USERNAME}`` resolved to ``nexusUser``, ``${NEXUS_PASSWORD}`` resolved to ``nexusPassword`` and ``${NEXUS_SERVER}`` resolved to http://209.38.204.141:8081 in this case) as follows:
      <pre>

      <img width="1440" alt="proxy" src="https://github.com/danglam88/buy-01/assets/119531235/a3ff75ca-19a1-4225-9164-eebe4ec526ad">

      </pre>
      The above ``settings.xml`` file will be used in the ``Dockerfile`` of each and every microservice during the execution of the ``docker build`` commands in the Build stage of the Jenkins pipeline in order to fetch the dependencies using ``maven-proxy`` repository on the nexus-server.

-  Usage Instructions:
   1.  Clone the project repository to your local machine using the following command:
   ```bash
   git clone git@github.com:danglam88/buy-01.git
   ```
   2.  Navigate to the project root directory, switch to nexus branch, make some changes, commit the changes then push them to nexus branch of the remote repository. After that, make a pull request to main branch, review the changes then approve and merge them to main branch. The Jenkins pipeline will be triggered shortly (using Webhooks in Github) for main branch. Different artifacts can be found on the nexus-server at different stages of the pipeline as follows:
   -  Dependencies can be found in ``maven-proxy`` repository after ``Build`` stage is done for the first execution of the Jenkins pipeline:
   <pre>

   <img width="440" alt="dependencies" src="https://github.com/danglam88/buy-01/assets/119531235/6dbce74d-3e33-4f33-8506-cdd87e3a1f3f">

   </pre>
   -  ``JAR`` and ``POM`` artifacts can be found in ``maven-snapshots`` repository after ``Deploy JAR and POM Artifacts to Nexus`` stage is done:
   <pre>

   <img width="770" alt="snapshots" src="https://github.com/danglam88/buy-01/assets/119531235/62d58916-25d9-402c-af95-2d1b82b9b966">

   </pre>
   -  Docker images can be found in ``nx-docker`` repository after ``Build`` stage is done:
   <pre>

   <img width="1440" alt="docker" src="https://github.com/danglam88/buy-01/assets/119531235/1d76669d-4f22-4142-8cab-14fbc876b1c6">

   </pre>
   3.  Finally, the application is accessible at https://164.92.252.125:4200 after the whole Jenkins pipeline has been completed.

## Dashboard URLs

Jenkins: http://164.90.178.137:8080

SonarQube: http://209.38.204.141:9000

Nexus: http://209.38.204.141:8081

Application: https://164.92.252.125:4200

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request if you would like to help improving the project.

## Authors

- [Danglam](https://github.com/danglam88)
- [Ashley](https://github.com/hgwtra)
- [Iuliia](https://github.com/ManWhoSoldTheW0rld)
- [Nafi](https://github.com/NafiRanta)
