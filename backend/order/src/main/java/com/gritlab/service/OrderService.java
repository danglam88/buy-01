package com.gritlab.service;

import com.gritlab.model.*;
import com.gritlab.repository.OrderItemRepository;
import com.gritlab.repository.OrderItemRepositoryCustom;
import com.gritlab.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    OrderItemRepositoryCustom customRepository;


    public OrderHistory getOrdersByBuyerId(String buyerId) {

        OrderHistory history = new OrderHistory();
        List<OrderResponse> ordersFullData = new ArrayList<>();
        List<Order> orders = orderRepository.findByBuyerId(buyerId);

        for (Order order: orders) {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());

            OrderResponse fullOrderData = OrderResponse.builder()
                    .orderId(order.getOrderId())
                    .statusCode(order.getStatusCode())
                    .items(convertToDTO(items))
                    .paymentCode(order.getPaymentCode())
                    .build();
            ordersFullData.add(fullOrderData);
        }

        history.setOrders(ordersFullData);
        history.setTopProducts(customRepository.sumQuantityByProductIdAndBuyerId(buyerId));
        history.setTotalAmount(customRepository.getTotalSumItemPriceByBuyerId(buyerId));

        return history;
    }

    public OrderResponse getOrderByOrderIdAndBuyerId(String orderId, String buyerId) {

        Order order = orderRepository.findByOrderIdAndBuyerId(orderId, buyerId).orElseThrow();

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .statusCode(order.getStatusCode())
                .items(convertToDTO(items))
                .paymentCode(order.getPaymentCode())
                .build();
    }

    public List<OrderResponse> getOrdersBySellerId(String sellerId) {

        List<OrderResponse> responseItems = new ArrayList<>();
        return responseItems;
    }

    public List<OrderItemResponse> convertToDTO(List<OrderItem> orderItems) {

        return orderItems.stream()
                .map(OrderItemResponse::fromOrderItem)
                .collect(Collectors.toList());
    }

    public String addOrder(String buyerId, OrderRequest data) {

        Order order = Order.builder()
                .buyerId(buyerId)
                .statusCode(OrderStatus.CREATED)
                .paymentCode(data.getPaymentCode())
                .build();

        Order newOrder = orderRepository.save(order);

        String orderId = newOrder.getOrderId();

        List<OrderItem> items = orderItemRepository.findByBuyerIdAndOrderIdIsNull(buyerId);

        for (OrderItem orderItem: items) {
            orderItem.setOrderId(orderId);

            //mock
            orderItem.setName("Mock Product");
            orderItem.setDescription("Mock Description");
            orderItem.setItemPrice(200.0);

            orderItemRepository.save(orderItem);
        }

        return orderId;
    }

    public void updateOrder(String orderId, String buyerId, OrderRequest data) {

        Order order = orderRepository.findByOrderIdAndBuyerId(orderId, buyerId).orElseThrow();
        order.setStatusCode(data.getStatusCode());
        orderRepository.save(order);
    }

    public void deleteOrder(String orderId, String buyerId) {

        Order order = orderRepository.findByOrderIdAndBuyerId(orderId, buyerId).orElseThrow();
        orderRepository.delete(order);
    }
}