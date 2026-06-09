import 'package:flutter/material.dart';
import 'package:good_gut/src/components/diet_screen/food_item.dart';
import 'package:good_gut/src/components/diet_screen/food_model.dart';
import 'package:good_gut/src/services/client_api_service.dart';
import 'package:good_gut/src/utils/diet_food_mapper.dart';

class MyDietPlanSection extends StatefulWidget {
  final int selectedDayOfWeek;
  final ValueChanged<int> onDayChanged;

  const MyDietPlanSection({
    super.key,
    required this.selectedDayOfWeek,
    required this.onDayChanged,
  });

  @override
  State<MyDietPlanSection> createState() => _MyDietPlanSectionState();
}

class _MyDietPlanSectionState extends State<MyDietPlanSection> {
  Map<String, dynamic>? plan;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadPlan();
  }

  Future<void> _loadPlan() async {
    setState(() => loading = true);
    final data = await ClientApiService.fetchDietPlan();
    if (!mounted) return;
    setState(() {
      plan = data;
      loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (plan == null) {
      return const Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          children: [
            Icon(Icons.restaurant_menu, size: 48, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'No diet plan assigned yet',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 8),
            Text(
              'Your nutritionist can create and assign a diet plan from the portal. It will appear here automatically.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    final meals = (plan!['meals'] as List?)
            ?.whereType<Map>()
            .map((m) => Map<String, dynamic>.from(m))
            .toList() ??
        [];
    final dayMeals =
        DietFoodMapper.mealsForDayOfWeek(meals, widget.selectedDayOfWeek);
    final grouped = DietFoodMapper.groupByMealType(dayMeals);
    final totalKcal = DietFoodMapper.totalKcal(dayMeals);

    return RefreshIndicator(
      onRefresh: _loadPlan,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: const Color(0xFFFDEED7),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Assigned by your nutritionist',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFF07E28),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${_formatDate(plan!['start_date'])} → ${_formatDate(plan!['end_date'])}',
                    style: const TextStyle(fontSize: 14),
                  ),
                  if (plan!['notes']?.toString().isNotEmpty == true) ...[
                    const SizedBox(height: 8),
                    Text(plan!['notes'].toString()),
                  ],
                  const SizedBox(height: 8),
                  Text(
                    '${totalKcal.toStringAsFixed(0)} kcal target for ${DietFoodMapper.dayLabels[widget.selectedDayOfWeek]}',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 44,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 7,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final selected = widget.selectedDayOfWeek == index;
                return ChoiceChip(
                  label: Text(DietFoodMapper.dayLabels[index].substring(0, 3)),
                  selected: selected,
                  selectedColor: const Color(0xFFF07E28),
                  labelStyle: TextStyle(
                    color: selected ? Colors.white : Colors.black,
                  ),
                  onSelected: (_) => widget.onDayChanged(index),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          if (dayMeals.isEmpty)
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'No meals scheduled for this day in your plan.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
            )
          else
            ...grouped.keys.map((mealType) {
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        mealType,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      ...grouped[mealType]!.map(
                        (item) => FoodItem(
                          foodItem: item,
                          onSelected: (_) {},
                          showIcon: false,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }

  String _formatDate(dynamic value) {
    if (value == null) return '—';
    final text = value.toString();
    return text.length >= 10 ? text.substring(0, 10) : text;
  }
}
