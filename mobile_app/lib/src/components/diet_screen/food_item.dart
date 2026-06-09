import 'package:flutter/material.dart';
import 'package:good_gut/src/components/common/icons.dart';
import 'package:good_gut/src/components/diet_screen/food_model.dart';

class FoodItem extends StatelessWidget {
  final FoodItemModel foodItem;
  final ValueChanged<bool?> onSelected;
  final bool showIcon;

  const FoodItem({super.key, required this.foodItem, required this.onSelected,  this.showIcon = true});

   void _showReceipeModel(BuildContext context) {
    showModalBottomSheet(
      backgroundColor: Colors.white,
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (BuildContext context) {
        return SizedBox(
          width:  MediaQuery.of(context).size.width,
          // height: 400,
          child: const SingleChildScrollView(
            child: Column(
              children: [
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                  Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                  Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),
                Text("Testing Content is this"),

              ],
            ),
          ),
        );
      },
    );
  }


  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      elevation: 0,
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          children: [
            Image.asset(
              foodItem.image,
              width: 50,
              height: 50,
              fit: BoxFit.cover,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          foodItem.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      foodItem.isVeg ? const VegIcon() : const NonVegIcon(),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Text('${foodItem.quantity} | ${foodItem.kcal}'),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 2, horizontal: 8),
                                decoration: BoxDecoration(
                                  color:
                                      Colors.grey[300], // Light grey background
                                  borderRadius: BorderRadius.circular(
                                      8), // Rounded corners
                                ),
                                child: Text(foodItem.p),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 2, horizontal: 8),
                                decoration: BoxDecoration(
                                  color: Colors.grey[300],
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(foodItem.c),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 2, horizontal: 8),
                                decoration: BoxDecoration(
                                  color: Colors.grey[300],
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(foodItem.f),
                              ),
                            ],
                          ),
                        ],
                      ),
                   showIcon ?   Row(
                        children: [
                          IconButton(
                            enableFeedback: false,
                            icon: const Icon(Icons.info),
                            onPressed: () {
                              _showReceipeModel(context);
                            },
                          ),
                          Checkbox(
                            value: foodItem.isSelected,
                            onChanged: onSelected,
                            activeColor: Colors.green,
                          ),
                        ],
                      ) : Container()
                    ],
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
