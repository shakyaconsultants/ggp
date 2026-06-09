import 'package:flutter/material.dart';
import 'package:good_gut/src/components/common/coming_soon_banner.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/shop_screen/step_indicator.dart';

class CheckoutPage extends StatelessWidget {
  final String productName;
  final String productImage;
  final double productPrice;
  final String selectedAddress;
  final String productId;

  const CheckoutPage(
      {super.key,
      required this.productName,
      required this.productImage,
      required this.productPrice,
      required this.selectedAddress,
      required this.productId});

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
        title: const Text('Checkout'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const ComingSoonBanner(
                message:
                    'Checkout is not live yet. Browse products from your nutritionist\'s catalog.',
              ),
                const StepIndicator(currentStep: 2),
              const Text(
                'Product Details',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Row(
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
                          style: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '₹${productPrice.toStringAsFixed(2)}',
                          style: const TextStyle(
                              fontSize: 16, color: Colors.green),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),

              // Address Details
              const Text(
                'Address Details',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                selectedAddress,
                style: const TextStyle(fontSize: 16),
              ),
              const Divider(height: 24),

              // Price Breakup
              const Text(
                'Price Breakup',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              _buildPriceRow('Product Price:', productPrice),
              _buildPriceRow(
                  'Shipping Charges:', 5.00), // Example shipping charges
              const Divider(height: 24),
              _buildPriceRow('Total Amount:', productPrice + 5.00,
                  isTotal: true),

              const SizedBox(height: 40),
              Center(
                child: GGPButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                              'Checkout is coming soon. Products are available to browse in the shop.'),
                        ),
                      );
                    },
                    text: "Checkout"),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Helper method to build price row
  Widget _buildPriceRow(String label, double amount, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: isTotal ? 18 : 16)),
        Text(
          '₹${amount.toStringAsFixed(2)}',
          style: TextStyle(
            fontSize: isTotal ? 18 : 16,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
