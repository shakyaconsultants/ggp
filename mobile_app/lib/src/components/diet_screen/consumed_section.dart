import 'package:flutter/material.dart';
import 'package:good_gut/src/components/diet_screen/food_item.dart';
import 'package:good_gut/src/components/diet_screen/food_model.dart';
import 'package:good_gut/src/services/client_api_service.dart';
import 'package:good_gut/src/utils/diet_food_mapper.dart';

class ConsumedSection extends StatefulWidget {
  final DateTime selectedDate;
  final VoidCallback? onMealsChanged;

  const ConsumedSection({
    super.key,
    required this.selectedDate,
    this.onMealsChanged,
  });

  @override
  State<ConsumedSection> createState() => _ConsumedSectionState();
}

class _ConsumedSectionState extends State<ConsumedSection> {
  Map<String, List<FoodItemModel>> meals = {};
  bool isTipVisible = true;
  bool loading = true;
  double consumedKcal = 0;
  double targetKcal = 0;
  String? emptyMessage;

  @override
  void initState() {
    super.initState();
    loadFoodItems();
  }

  @override
  void didUpdateWidget(covariant ConsumedSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedDate != widget.selectedDate) {
      loadFoodItems();
    }
  }

  Future<void> loadFoodItems() async {
    setState(() => loading = true);

    final items =
        await ClientApiService.fetchConsumedMeals(widget.selectedDate);
    final targetItems =
        await ClientApiService.fetchDietTargetForDate(widget.selectedDate);
    final grouped = DietFoodMapper.groupByMealType(items);

    if (!mounted) return;
    setState(() {
      meals = grouped;
      consumedKcal = DietFoodMapper.totalKcal(items);
      targetKcal = DietFoodMapper.totalKcal(targetItems);
      loading = false;
      if (items.isEmpty) {
        emptyMessage = 'No meals logged for this date yet.';
      } else {
        emptyMessage = null;
      }
    });
  }

  Future<void> _deleteMeal(int mealId) async {
    final ok = await ClientApiService.deleteMeal(mealId);
    if (!mounted) return;
    if (ok) {
      await loadFoodItems();
      widget.onMealsChanged?.call();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not delete meal')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }

    final double goal = targetKcal > 0 ? targetKcal : 1600.0;
    final double diff = consumedKcal - goal;

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
            if (meals.isNotEmpty) _buildProgressSection(goal, diff),
            isTipVisible ? _buildTipSection() : Container(),
            for (var meal in meals.keys) _buildMealSection(meal),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressSection(double goal, double diff) {
    final progress = goal > 0 ? (consumedKcal / goal).clamp(0.0, 1.0) : 0.0;
    return Padding(
      padding: const EdgeInsets.only(top: 16.0, bottom: 16),
      child: Column(
        children: [
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: Colors.grey[300],
            color: diff > 0 ? Colors.red : Colors.green,
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${consumedKcal.toStringAsFixed(1)} of ${goal.toStringAsFixed(0)} Kcal'),
              Text(
                diff > 0
                    ? 'Exceeds By: ${diff.toStringAsFixed(1)} Kcal'
                    : 'Remaining: ${(-diff).toStringAsFixed(1)} Kcal',
                style: TextStyle(color: diff > 0 ? Colors.red : Colors.green),
              ),
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
            child: Text(
              mealType,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: meals[mealType]?.length ?? 0,
            itemBuilder: (context, index) {
              final item = meals[mealType]![index];
              return Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: FoodItem(
                          foodItem: item,
                          onSelected: (selected) {
                            setState(() {
                              item.isSelected = selected ?? false;
                            });
                          },
                          showIcon: false,
                        ),
                      ),
                      if (item.mealId != null)
                        IconButton(
                          icon: const Icon(Icons.delete_outline,
                              color: Colors.red),
                          onPressed: () => _deleteMeal(item.mealId!),
                        ),
                    ],
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
