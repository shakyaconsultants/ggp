import 'dart:convert';

import 'package:good_gut/src/components/diet_screen/food_model.dart';

class DietFoodMapper {
  static const dayLabels = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  static int backendDayOfWeek(DateTime date) => date.weekday % 7;

  static Map<String, dynamic>? parseJsonMap(dynamic value) {
    if (value == null) return null;
    if (value is Map) return Map<String, dynamic>.from(value);
    if (value is String && value.trim().isNotEmpty) {
      try {
        final decoded = jsonDecode(value);
        if (decoded is Map) return Map<String, dynamic>.from(decoded);
      } catch (_) {}
    }
    return null;
  }

  static List<dynamic> parseJsonList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value;
    if (value is String && value.trim().isNotEmpty) {
      try {
        final decoded = jsonDecode(value);
        if (decoded is List) return decoded;
        if (decoded is Map) return [decoded];
      } catch (_) {
        try {
          return jsonDecode('[$value]') as List? ?? [];
        } catch (_) {}
      }
    }
    return [];
  }

  static List<Map<String, dynamic>> normalizePlanMeals(dynamic meals) {
    return parseJsonList(meals)
        .whereType<Map>()
        .map((m) => Map<String, dynamic>.from(m))
        .map((meal) {
      final normalized = Map<String, dynamic>.from(meal);
      final foodItem = parseJsonMap(meal['food_item']);
      if (foodItem != null) normalized['food_item'] = foodItem;

      final template = parseJsonMap(meal['template']);
      if (template != null) {
        template['food_items'] = parseJsonList(template['food_items']);
        normalized['template'] = template;
      }
      return normalized;
    }).toList();
  }

  static double parseKcal(String kcal) {
    final cleaned = kcal.replaceAll(RegExp(r'[^0-9.]'), '');
    return double.tryParse(cleaned) ?? 0;
  }

  static String _macroLabel(String prefix, dynamic value) {
    if (value == null) return '$prefix: 0g';
    final text = value.toString();
    if (text.contains(':')) return text;
    return '$prefix: ${text}g';
  }

  static FoodItemModel fromFoodItemJson(
    Map<String, dynamic> food,
    String mealType, {
    dynamic quantity,
    bool isSelected = false,
  }) {
    final image = food['image']?.toString() ?? '';
    final kcalValue = food['kcal'];
    return FoodItemModel(
      name: food['name']?.toString() ?? 'Food item',
      quantity: quantity?.toString() ?? food['quantity']?.toString() ?? '',
      kcal: kcalValue != null ? '$kcalValue Kcal' : '0 Kcal',
      p: _macroLabel('P', food['p']),
      c: _macroLabel('C', food['c']),
      f: _macroLabel('F', food['f']),
      image: image.isNotEmpty ? image : 'assets/images/flutter_logo.png',
      isVeg: food['isVeg'] == true || food['isVeg'] == 1,
      isSelected: isSelected,
      mealType: mealType,
    );
  }

  static FoodItemModel fromTrackedMeal(Map<String, dynamic> meal) {
    final kcalValue = meal['kcal'];
    final image = meal['image']?.toString() ?? '';
    return FoodItemModel(
      name: meal['name']?.toString() ?? 'Meal',
      quantity: meal['quantity']?.toString() ?? '',
      kcal: kcalValue != null ? '$kcalValue Kcal' : '0 Kcal',
      p: _macroLabel('P', meal['p']),
      c: _macroLabel('C', meal['c']),
      f: _macroLabel('F', meal['f']),
      image: image.isNotEmpty ? image : 'assets/images/flutter_logo.png',
      isVeg: meal['isVeg'] == true || meal['isVeg'] == 1,
      isSelected: meal['isSelected'] == true || meal['isSelected'] == 1,
      mealType: meal['mealType']?.toString() ?? 'Other',
      mealId: int.tryParse(meal['mealId']?.toString() ?? ''),
    );
  }

  static List<FoodItemModel> mealsForDayOfWeek(
    List<Map<String, dynamic>> planMeals,
    int dayOfWeek,
  ) {
    final items = <FoodItemModel>[];

    for (final meal in planMeals) {
      if (int.tryParse(meal['day_of_week']?.toString() ?? '-1') != dayOfWeek) {
        continue;
      }

      final mealType = meal['meal_type']?.toString() ?? 'Other';
      final quantity = meal['quantity'];

      final foodItem = parseJsonMap(meal['food_item']);
      if (foodItem != null) {
        items.add(fromFoodItemJson(foodItem, mealType, quantity: quantity));
      }

      final template = parseJsonMap(meal['template']);
      if (template != null) {
        for (final entry in parseJsonList(template['food_items'])) {
          if (entry is! Map) continue;
          final entryMap = Map<String, dynamic>.from(entry);
          items.add(fromFoodItemJson(
            entryMap,
            mealType,
            quantity: entryMap['quantity'] ?? quantity,
          ));
        }
      }
    }

    return items;
  }

  static List<FoodItemModel> mealsForDay(
    List<dynamic> planMeals,
    DateTime date,
  ) {
    final normalized = planMeals.every((m) => m is Map)
        ? planMeals.whereType<Map>().map((m) => Map<String, dynamic>.from(m)).toList()
        : normalizePlanMeals(planMeals);
    return mealsForDayOfWeek(normalized, backendDayOfWeek(date));
  }

  static Map<String, List<FoodItemModel>> groupByMealType(
    List<FoodItemModel> items,
  ) {
    final grouped = <String, List<FoodItemModel>>{};
    for (final item in items) {
      grouped.putIfAbsent(item.mealType, () => []).add(item);
    }
    return grouped;
  }

  static double totalKcal(List<FoodItemModel> items) {
    return items.fold(0, (sum, item) => sum + parseKcal(item.kcal));
  }
}
