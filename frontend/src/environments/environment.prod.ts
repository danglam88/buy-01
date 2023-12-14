const userBaseUrl = 'https://164.92.252.125:8443'
const productBaseUrl = 'https://164.92.252.125:8444'
const mediaBaseUrl = 'https://164.92.252.125:8445'
const orderBaseUrl = 'https://164.92.252.125:8446'

export const environment = {
    production: false,
    authUrl: `${userBaseUrl}/auth`,
    regUrl: `${userBaseUrl}/reg`,
    userInfoUrl: `${userBaseUrl}/users/userInfo`,
    userUrl: `${userBaseUrl}/users/`,
    avatarUserUrl: `${userBaseUrl}/users/avatar/`,
    productUrl: `${productBaseUrl}/products`,
    sellerProductUrl: `${productBaseUrl}/products/seller`,
    mediaUrl: `${mediaBaseUrl}/media`,
    productMediaUrl: `${mediaBaseUrl}/media/product/`,
    orderUrl: `${orderBaseUrl}/order`,
    sellerOrderUrl: `${orderBaseUrl}/order/seller`,
    clientOrderUrl: `${orderBaseUrl}/order/client`,
    redoOrderUrl: `${orderBaseUrl}/order/redo`,
    orderItemUrl: `${orderBaseUrl}/order/item`,
    cancelOrderItemUrl: `${orderBaseUrl}/order/item/cancel`,
    statusOrderItemUrl: `${orderBaseUrl}/order/item/status`,
    redoOrderItemUrl: `${orderBaseUrl}/order/item/redo`
};
