const userBaseUrl = 'http://localhost:8080'
const productBaseUrl = 'http://localhost:8081'
const mediaBaseUrl = 'http://localhost:8082'
const orderBaseUrl = 'http://localhost:8083'

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
    statusOrderItemUrl: `${orderBaseUrl}/order/item/status`
    cancelOrderItemUrl: `${orderBaseUrl}/order/item/cancel`,
    statusOrderItemUrl: `${orderBaseUrl}/order/item/status`,
    redoOrderItemUrl: `${orderBaseUrl}/order/item/redo`
};
