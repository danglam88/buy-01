# Java Buy-01 Project

## Table of Contents
- [Description](#description)
- [Front-end Specifications](#front-end-specifications)
- [Back-end Specifications](#back-endspecifications)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Contributing](#contributing)
- [Author](#author)

## Description

This is a Java project that developes and end-to-end e-commerce platform with Spring Boot microservices and Angular. The platplorms supports user registration (either as a client or a seller), authentication, product CRUD functionality exclusively for sellers, and media management for product images.

* Role-based functionalities: A user can either register as a seller or a Client
- Seller: Can access the home page with product listings view. Sellers have the ability to create products and manage their products. They also have the ability to view and update their own profile.
- Client: Can access the home page with product listings view. They have the ability to view and update their own profile.

## Front-end Specifications

- Sign-In/ Up Pages: `/login` and `/register` - Authentication views. 
- Homepage `/home` - Once a user is authenticated, he/she will be directed to homepage. A simple view to display all products. 
- Seller Product Management `/product-dashboard` - If a user is authenticated as seller, he/she will be able to create products and manage their products.
- User Profile `/user-dashboard` - Users can view and update their information.

## Back-end Specifications


## Installation

To install the project, clone the repository to your local machine.

```bash
git clone 
```

Make sure you have Docker Desktop installed and configured properly on your machine.

You can download Docker Desktop [here](https://www.docker.com/products/docker-desktop/).

## Usage

To run the project, navigate to the project root directory and then run the command.

```bash
docker-compose up -d
```

This will start the server at `https://localhost:4200/` and the above-mentioned APIs are ready for use.

Postman is a great tool for testing RESTful APIs. You can download it [here](https://www.postman.com/downloads/).

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request if you would like to help improving the project.

## Author

- [Danglam](https://github.com/danglam88)
- [Ashley] (https://github.com/hgwtra)
- [Iuliia] (https://github.com/ManWhoSoldTheW0rld)
- [Nafi] (https://github.com/NafiRanta)
