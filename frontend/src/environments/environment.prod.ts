const userBaseUrl = 'https://164.92.252.125:8443'
const productBaseUrl = 'https://164.92.252.125:8444'
const mediaBaseUrl = 'https://164.92.252.125:8445'

export const environment = {
    production: true,
    authUrl: `${userBaseUrl}/auth`,
    regUrl: `${userBaseUrl}/reg`,
    userInfoUrl: `${userBaseUrl}/users/userInfo`,
    userUrl: `${userBaseUrl}/users/`,
    avatarUserUrl: `${userBaseUrl}/users/avatar/`,
    productUrl: `${productBaseUrl}/products`,
    sellerProductUrl: `${productBaseUrl}/products/seller`,
    mediaUrl: `${mediaBaseUrl}/media`,
    productMediaUrl: `${mediaBaseUrl}/media/product/`,
};
