import 'package:flutter/material.dart';
import 'package:good_gut/src/components/common/coming_soon_banner.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/shop_screen/checkout.dart';
import 'package:good_gut/src/components/shop_screen/new_address.dart';
import 'package:good_gut/src/components/shop_screen/step_indicator.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class AddressSelectionPage extends StatefulWidget {
  final String productName;
  final String productImage;
  final double productPrice;
  final String productId;

  const AddressSelectionPage(
      {super.key,
      required this.productName,
      required this.productImage,
      required this.productPrice,
      required this.productId});

  @override
  _AddressSelectionPageState createState() => _AddressSelectionPageState();
}

class _AddressSelectionPageState extends State<AddressSelectionPage> {
  List<String> savedAddresses = [
    "123 Main St, Springfield",
    "456 Oak St, Gotham City",
    "789 Maple Ave, Metropolis",
  ];

  String? selectedAddress;

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
        title: const Text('Select Address'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const ComingSoonBanner(
              message: 'Saved addresses and delivery will be enabled with checkout.',
            ),
            const StepIndicator(currentStep: 1),
            Container(
              decoration: BoxDecoration(
                border: Border.all(
                  color: Theme.of(context).colorScheme.primary,
                  width: 1,
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: ListTile(
                leading: Icon(Icons.add,
                    color: Theme.of(context).colorScheme.primary),
                title: Text(
                  'Add a new address',
                  style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold),
                ),
                onTap: () async {
                  final result = await Navigator.push(
                    context,
                    SlideInRouter(screen: const AddNewAddressPage()),
                  );

                  if (result != null) {
                    setState(() {
                      savedAddresses.add(result as String);
                      selectedAddress = result;
                    });
                  }
                },
              ),
            ),
            const SizedBox(height: 16),
            const Divider(thickness: 2),
            const SizedBox(height: 16),
            const Text(
              "Select Saved Address",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            savedAddresses.isEmpty
                ? const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16.0),
                    child: Center(
                      child: Text(
                        "No saved addresses found. Please add a new address.",
                        style: TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                    ),
                  )
                : Column(
                    children: savedAddresses.map((address) {
                      return RadioListTile<String>(
                        title: Text(address),
                        value: address,
                        groupValue: selectedAddress,
                        onChanged: (String? value) {
                          setState(() {
                            selectedAddress = value;
                          });
                        },
                      );
                    }).toList(),
                  ),
            const SizedBox(height: 16),
            Center(
              child: GGPButton(
                onPressed: () {
                  if (selectedAddress != null) {
                    Navigator.push(
                      context,
                      SlideInRouter(
                          screen: CheckoutPage(
                        productImage: widget.productImage,
                        productName: widget.productName,
                        productPrice: widget.productPrice,
                        productId: widget.productId,
                        selectedAddress: selectedAddress ?? "",
                      )),
                    );
                    print("Address Selected: $selectedAddress");
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Please select or add an address"),
                      ),
                    );
                  }
                },
                text: "Continue to Buy",
              ),
            ),
          ],
        ),
      ),
    );
  }
}
