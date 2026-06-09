import 'package:flutter/material.dart';
import 'package:good_gut/src/components/common/coming_soon_banner.dart';
import 'package:good_gut/src/components/shop_screen/order_details.dart';
import 'package:good_gut/src/utils/slide_router.dart';

// Model for Product
class Product {
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

  Product({
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

  // Factory method to create a Product object from JSON
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      orderId: json['orderId'],
      orderDate: json['orderDate'],
      productName: json['productName'],
      productImage: json['productImage'],
      productPrice: json['productPrice'].toDouble(),
      quantity: json['quantity'],
      shippingAddress: json['shippingAddress'],
      paymentMethod: json['paymentMethod'],
      totalAmount: json['totalAmount'].toDouble(),
      orderStatus: json['orderStatus'],
    );
  }
}

class MyOrdersScreen extends StatefulWidget {
  const MyOrdersScreen({super.key});

  @override
  _MyOrdersScreenState createState() => _MyOrdersScreenState();
}

class _MyOrdersScreenState extends State<MyOrdersScreen> {
  late Future<List<Product>> _productsFuture;

  @override
  void initState() {
    super.initState();
    _productsFuture = _fetchProducts();
  }

  // Method to load JSON and parse product data
  Future<List<Product>> _fetchProducts() async {
    return [];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
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
        title: const Text('My Orders'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: FutureBuilder<List<Product>>(
        future: _productsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return const Center(child: Text('Error loading products.'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                children: [
                  ComingSoonBanner(
                    message:
                        'Order history will appear here once checkout is enabled.',
                  ),
                  SizedBox(height: 24),
                  Center(child: Text('No orders yet.')),
                ],
              ),
            );
          }

          final products = snapshot.data!;

          return SingleChildScrollView(
            child: Column(
              children: products
                  .map((product) => _buildOrderCard(context, product))
                  .toList(),
            ),
          );
        },
      ),
    );
  }

  Widget _buildOrderCard(BuildContext context, Product product) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: Colors.grey, width: 0.2),
      ),
      child: Padding(
        padding: const EdgeInsets.only(top: 8),
        child: Column(
          children: [
            ListTile(
              onTap: () => Navigator.push(
                context,
                SlideInRouter(
                  screen: OrderDetailsPage(
                    orderId: product.orderId,
                    orderDate: product.orderDate,
                    productName: product.productName,
                    productImage: product.productImage,
                    productPrice: product.productPrice,
                    quantity: product.quantity,
                    shippingAddress: product.shippingAddress,
                    paymentMethod: product.paymentMethod,
                    totalAmount: product.totalAmount,
                    orderStatus: product.orderStatus,
                  ),
                ),
              ),
              leading: Image.network(
                product.productImage,
                width: 50,
                height: 50,
                fit: BoxFit.cover,
              ),
              title: Text(
                product.productName,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: const Text('See your order details'),
              trailing: const Icon(Icons.arrow_forward_ios),
            ),
          ],
        ),
      ),
    );
  }
}
