import 'package:flutter/material.dart';
import 'package:good_gut/src/components/diet_screen/food_item.dart';
import 'package:good_gut/src/components/diet_screen/food_model.dart';
import 'package:good_gut/src/services/client_api_service.dart';
import 'package:good_gut/src/utils/diet_food_mapper.dart';

class TargetSection extends StatefulWidget {
  final DateTime selectedDate;

  const TargetSection({super.key, required this.selectedDate});

  @override
  State<TargetSection> createState() => _TargetSectionState();
}

class _TargetSectionState extends State<TargetSection> {
  Map<String, List<FoodItemModel>> meals = {};
  bool isTipVisible = true;
  bool loading = true;
  double totalTargetKcal = 0;
  String? emptyMessage;

  @override
  void initState() {
    super.initState();
    loadFoodItems();
  }

  @override
  void didUpdateWidget(covariant TargetSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedDate != widget.selectedDate) {
      loadFoodItems();
    }
  }

  Future<void> loadFoodItems() async {
    setState(() {
      loading = true;
      emptyMessage = null;
    });

    final items =
        await ClientApiService.fetchDietTargetForDate(widget.selectedDate);
    final grouped = DietFoodMapper.groupByMealType(items);
    final total = DietFoodMapper.totalKcal(items);

    if (!mounted) return;
    setState(() {
      meals = grouped;
      totalTargetKcal = total;
      loading = false;
      if (items.isEmpty) {
        emptyMessage =
            'No diet plan assigned for this day. Your nutritionist can add one from the portal.';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            if (emptyMessage != null)
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  emptyMessage!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.grey),
                ),
              ),
            if (meals.isNotEmpty) _buildProgressSection(),
            isTipVisible ? _buildTipSection() : Container(),
            for (var meal in meals.keys) _buildMealSection(meal),
            const SizedBox(
              height: 48,
            ),
          ],
        ),
      ),
    );
  }

  double _calculateTotalCalories(String mealType) {
    return meals[mealType]?.fold(0.0, (sum, item) {
          return sum! + DietFoodMapper.parseKcal(item.kcal);
        }) ??
        0;
  }

  Widget _buildProgressSection() {
    return Padding(
      padding: const EdgeInsets.only(top: 16.0, bottom: 16),
      child: Column(
        children: [
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: totalTargetKcal > 0 ? 1.0 : 0,
            backgroundColor: Colors.grey[300],
            color: const Color(0xFF486A21),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${totalTargetKcal.toStringAsFixed(1)} Kcal target'),
              const Text('Assigned by nutritionist',
                  style: TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTipSection() {
    return Padding(
      padding: const EdgeInsets.only(top: 8.0, bottom: 8.0),
      child: Card(
        color: Colors.orange[100],
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Row(
            children: [
              const Icon(Icons.lightbulb, color: Colors.orange),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  "Pro Tip: For best results, always measure uncooked food",
                  style: TextStyle(color: Colors.orange[900]),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.orange),
                onPressed: () {
                  setState(() {
                    isTipVisible = false;
                  });
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMealSection(String mealType) {
    double totalCalories = _calculateTotalCalories(mealType);
    return Card(
      elevation: 2,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: Colors.grey, width: 0.2),
      ),
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 16.0, left: 16.0),
            child: Row(
              children: [
                Text(
                  mealType,
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(" (${totalCalories.toStringAsFixed(1)} Kcal)",
                    style: const TextStyle(fontSize: 14))
              ],
            ),
          ),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: meals[mealType]?.length ?? 0,
            itemBuilder: (context, index) {
              return Column(
                children: [
                  FoodItem(
                    foodItem: meals[mealType]![index],
                    onSelected: (selected) {
                      setState(() {
                        meals[mealType]![index].isSelected = selected ?? false;
                      });
                    },
                  ),
                  if (index < (meals[mealType]?.length ?? 0) - 1)
                    const Divider(
                      thickness: 0.2,
                      color: Colors.grey,
                    ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
