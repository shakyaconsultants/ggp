import 'package:flutter/material.dart';
import 'package:good_gut/src/components/shop_screen/product_page.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class ShopItem extends StatelessWidget {
  final String imageUrl;
  final String name;
  final int originalPrice;
  final double discountedPrice;
  final int discount;
  final double rating;
  final String delivery;
  final String description;
  final String productId;

  const ShopItem(
      this.imageUrl,
      this.name,
      this.originalPrice,
      this.discountedPrice,
      this.discount,
      this.rating,
      this.delivery,
      this.description,
      this.productId,
      {super.key});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          SlideInRouter(
              screen: ProductPage(
            imageUrl: imageUrl,
            name: name,
            originalPrice: originalPrice,
            discountedPrice: discountedPrice,
            discount: discount,
            rating: rating,
            delivery: delivery,
            description: description,
            productId: productId,
          )),
        );
      },
      child: Card(
        color: Colors.white,
        elevation: 2.0,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Image.network(imageUrl, fit: BoxFit.cover),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                name,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Row(
                children: [
                  Text(
                    "₹$discountedPrice",
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, color: Colors.green),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    "₹$originalPrice",
                    style: const TextStyle(
                      decoration: TextDecoration.lineThrough,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    "$discount% off",
                    style: const TextStyle(color: Colors.green),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
