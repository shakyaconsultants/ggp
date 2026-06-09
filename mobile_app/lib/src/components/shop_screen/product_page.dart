import 'package:flutter/material.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/shop_screen/address_page.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class ProductPage extends StatelessWidget {
  final String imageUrl;
  final String name;
  final int originalPrice;
  final double discountedPrice;
  final int discount;
  final double rating;
  final String delivery;
  final String description;
  final String productId;

  const ProductPage({
    super.key,
    required this.imageUrl,
    required this.name,
    required this.originalPrice,
    required this.discountedPrice,
    required this.discount,
    required this.rating,
    required this.delivery,
    required this.description,
    required this.productId,
  });

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
        title: const Text('Product Details'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Image.network(imageUrl, fit: BoxFit.cover),
            ),
            const SizedBox(height: 16.0),
            Text(
              name,
              style: const TextStyle(
                fontSize: 24.0,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8.0),
            Row(
              children: [
                Text(
                  "₹$discountedPrice",
                  style: const TextStyle(
                    fontSize: 20.0,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
                const SizedBox(width: 8.0),
                Text(
                  "₹$originalPrice",
                  style: const TextStyle(
                    fontSize: 16.0,
                    color: Colors.grey,
                    decoration: TextDecoration.lineThrough,
                  ),
                ),
                const SizedBox(width: 8.0),
                Text(
                  "$discount% off",
                  style: const TextStyle(
                    fontSize: 16.0,
                    color: Colors.green,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8.0),
            Text(
              "Delivery: $delivery",
              style: const TextStyle(
                fontSize: 16.0,
                color: Colors.black54,
              ),
            ),
            const SizedBox(height: 16.0),
            const Text(
              "Product Description",
              style: TextStyle(
                fontSize: 20.0,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8.0),
            Text(
              description, // Display the description here
              style: const TextStyle(
                fontSize: 16.0,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 24.0),
            Center(
              child: GGPButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      SlideInRouter(
                          screen: AddressSelectionPage(
                        productName: name,
                        productImage: imageUrl,
                        productPrice: discountedPrice,
                        productId: productId,
                      )),
                    );
                    print("Buy Now Clicked");
                  },
                  text: "Buy Now"),
            ),
          ],
        ),
      ),
    );
  }
}
