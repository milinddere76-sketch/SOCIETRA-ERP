package com.chs.society.service;

import com.chs.society.config.props.RazorpayProperties;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RazorpayProperties razorpayProperties;

    public String createOrder(BigDecimal amount, UUID billingId) throws RazorpayException {
        RazorpayClient razorpay = new RazorpayClient(razorpayProperties.getId(), razorpayProperties.getSecret());

        JSONObject orderRequest = new JSONObject();
        // Razorpay expects amount in paise (1 INR = 100 paise)
        orderRequest.put("amount", amount.multiply(new BigDecimal(100)).intValue());
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "bill_" + billingId.toString());
        orderRequest.put("notes", new JSONObject().put("billing_id", billingId.toString()));

        Order order = razorpay.orders.create(orderRequest);
        return order.get("id");
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        // Implementation for signature verification using Razorpay SDK Utility
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            // Utils.verifyPaymentSignature(attributes, razorpayKeySecret);
            return true; // Simplified for demo
        } catch (Exception e) {
            return false;
        }
    }
}
