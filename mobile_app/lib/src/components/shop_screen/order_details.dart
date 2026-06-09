import 'package:flutter/material.dart';

class OrderDetailsPage extends StatelessWidget {
  final String orderId;
  final String orderDate;
  final String productName;
  final String productImage;
  final double productPrice;
  final int quantity;
  final String shippingAddress;
  final String paymentMethod;
  final double totalAmount;
  final String orderStatus;

  const OrderDetailsPage({
    super.key,
    required this.orderId,
    required this.orderDate,
    required this.productName,
    required this.productImage,
    required this.productPrice,
    required this.quantity,
    required this.shippingAddress,
    required this.paymentMethod,
    required this.totalAmount,
    required this.orderStatus,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        centerTitle: true,
        titleTextStyle: const TextStyle(
            color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold),
        title: const Text('Order Details'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Order Summary
              const Text(
                'Order Summary',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              _buildOrderSummary(),

              const Divider(height: 24),

              // Product Information
              const Text(
                'Product Information',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              _buildProductDetails(),

              const Divider(height: 24),

              // Shipping Information
              const Text(
                'Shipping Information',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                shippingAddress,
                style: const TextStyle(fontSize: 16),
              ),

              const Divider(height: 24),

              // Payment Information
              const Text(
                'Payment Information',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              _buildPaymentDetails(),

              const Divider(height: 24),

              // Order Status
              const Text(
                'Order Status',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              _buildOrderStatus(),
            ],
          ),
        ),
      ),
    );
  }

  // Helper method to build order summary
  Widget _buildOrderSummary() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Order ID: $orderId', style: const TextStyle(fontSize: 16)),
        const SizedBox(height: 4),
        Text('Order Date: $orderDate', style: const TextStyle(fontSize: 16)),
      ],
    );
  }

  // Helper method to build product details section
  Widget _buildProductDetails() {
    return Row(
      children: [
        Image.network(
          productImage,
          width: 80,
          height: 80,
          fit: BoxFit.cover,
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                productName,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text('Quantity: $quantity', style: const TextStyle(fontSize: 16)),
              const SizedBox(height: 4),
              Text(
                '\$${productPrice.toStringAsFixed(2)}',
                style: const TextStyle(fontSize: 16, color: Colors.green),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Helper method to build payment details section
  Widget _buildPaymentDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Payment Method: $paymentMethod', style: const TextStyle(fontSize: 16)),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Total Amount:', style: TextStyle(fontSize: 16)),
            Text(
              '\$${totalAmount.toStringAsFixed(2)}',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ],
    );
  }

  // Helper method to build order status section
  Widget _buildOrderStatus() {
    Color statusColor = Colors.orange;
    if (orderStatus == 'Delivered') {
      statusColor = Colors.green;
    } else if (orderStatus == 'Cancelled') {
      statusColor = Colors.red;
    }

    return Row(
      children: [
        Icon(Icons.circle, color: statusColor, size: 16),
        const SizedBox(width: 8),
        Text(orderStatus, style: TextStyle(fontSize: 16, color: statusColor)),
      ],
    );
  }
}
