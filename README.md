# Java Buy-01 Project

## Table of Contents
- [Description](#description)
- [Front-end Specifications](#front-end-specifications)
- [Back-end Specifications](#back-endspecifications)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Contributing](#contributing)
- [Authors](#authors)

## Description

This is a Java project that developes and end-to-end e-commerce platform with Spring Boot microservices and Angular. The platplorms supports user registration (either as a client or a seller), authentication, product CRUD functionality exclusively for sellers, and media management for product images.

* Role-based functionalities: A user can either register as a Seller or a Client.
- Seller: Can access the home page with product listings view. Sellers have the ability to create products and manage their products. They also have the ability to view and update their own profile.
- Client: Can access the home page with product listings view. They have the ability to view and update their own profile.

## Front-end Specifications

- Sign-In/ Up Pages: `/login` and `/register` - Authentication views. 
- Homepage `/home` - Once a user is authenticated, he/she will be directed to homepage. A simple view to display all products. 
- Seller Product Management `/product-dashboard` - If a user is authenticated as seller, he/she will be able to create products and manage their products.
- User Profile `/user-dashboard` - Users can view and update their information.

## Back-end Specifications

The list of RESTful APIs to perform CRUD operations on Users (http://localhost:8443), Products (http://localhost:8444) and Media (http://localhost:8445) are:

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

## Installation

To install the project, clone the repository to your local machine.

```bash
git clone https://01.gritlab.ax/git/danglam/buy-01.git
```

Make sure you have Docker Desktop installed and configured properly on your machine.

You can download Docker Desktop [here](https://www.docker.com/products/docker-desktop/).

## Usage

To run the project, navigate to the project root directory and then run the command.

```bash
docker-compose up -d
```

This will start the server at `http://localhost:4200/` and the above-mentioned APIs are ready for use.

Postman is a great tool for testing RESTful APIs. You can download it [here](https://www.postman.com/downloads/).

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request if you would like to help improving the project.

## Authors

- [Danglam] (https://github.com/danglam88)
- [Ashley] (https://github.com/hgwtra)
- [Iuliia] (https://github.com/ManWhoSoldTheW0rld)
- [Nafi] (https://github.com/NafiRanta)

