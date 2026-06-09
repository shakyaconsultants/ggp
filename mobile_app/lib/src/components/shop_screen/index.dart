import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/components/menu/index.dart';
import 'package:good_gut/src/components/shop_screen/shop_item.dart';
import 'package:good_gut/src/navigation/main_tab_scope.dart';
import 'package:good_gut/src/utils/slide_router.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  _ShopScreenState createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  List<Map<String, dynamic>> items = [];
  bool isLoading = true;
  String errorMessage = '';
  String query = "";

  @override
  void initState() {
    super.initState();
    fetchProducts();
  }

  Future<void> fetchProducts() async {
    const headers = {'x-api-key': 'ggp-pro-ject'};

    try {
      final response =
          await http.get(Uri.parse(AppStrings.productsURL), headers: headers);

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          items = data
              .map((item) => {
                    'product_id': item['_id'],
                    'image': item['image'],
                    'name': item['name'],
                    'originalPrice': item['originalPrice'],
                    'discountedPrice': item['discountedPrice'],
                    'discount': item['discount'],
                    'rating': item['rating'],
                    'delivery': item['delivery'],
                    'description': item['description'],
                  })
              .toList();
          isLoading = false;
        });
      } else {
        setState(() {
          errorMessage = 'Failed to load products. Please try again.';
          isLoading = false;
        });
      }
    } catch (error) {
      setState(() {
        errorMessage = 'An error occurred: $error';
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        centerTitle: true,
        backgroundColor: const Color(0xFFF07E28),
        title: const Text(
          "Shop",
          style: TextStyle(
              color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.home_outlined, color: Colors.white),
          tooltip: 'Home',
          onPressed: () => MainTabScope.goHome(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.menu, color: Colors.white),
            onPressed: () {
              Navigator.push(
                context,
                SlideInRouter(screen: const MenuScreen()),
              );
            },
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage.isNotEmpty
              ? Center(
                  child: Text(
                    errorMessage,
                    style: const TextStyle(color: Colors.red, fontSize: 16),
                  ),
                )
              : GridView.builder(
                  padding: const EdgeInsets.all(10.0),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.7,
                    crossAxisSpacing: 10.0,
                    mainAxisSpacing: 10.0,
                  ),
                  itemCount: items.length,
                  itemBuilder: (ctx, i) {
                    if (items[i]['name']
                        .toLowerCase()
                        .contains(query.toLowerCase())) {
                      return ShopItem(
                        items[i]['image'],
                        items[i]['name'],
                        items[i]['originalPrice'],
                        items[i]['discountedPrice'].toDouble(),
                        items[i]['discount'],
                        items[i]['rating'],
                        items[i]['delivery'],
                        items[i]['description'],
                        items[i]['product_id'],
                      );
                    } else {
                      return const SizedBox.shrink();
                    }
                  }),
    );
  }
}
