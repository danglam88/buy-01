const userBaseUrl = 'http://localhost:8080'
const productBaseUrl = 'http://localhost:8081'
const mediaBaseUrl = 'http://localhost:8082'

export const environment = {
    production: false,
    authUrl: `${userBaseUrl}/auth`,
    regUrl: `${userBaseUrl}/reg`,
    userInfoUrl: `${userBaseUrl}/users/userInfo`,
    userUrl: `${userBaseUrl}/users/`,
    avatarUserUrl: `${userBaseUrl}/users/avatar/`,
    productUrl: `${productBaseUrl}/products`,
    sellerProductUrl: `${productBaseUrl}/products/seller`,
    addToCartUrl: `${productBaseUrl}/order/position`,
    mediaUrl: `${mediaBaseUrl}/media`,
    productMediaUrl: `${mediaBaseUrl}/media/product/`,
};
