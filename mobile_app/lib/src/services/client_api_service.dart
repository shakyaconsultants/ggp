import 'package:good_gut/src/utils/api_util.dart';
import 'package:good_gut/src/utils/diet_food_mapper.dart';
import 'package:good_gut/src/components/diet_screen/food_model.dart';
import 'package:good_gut/src/components/home/workout/workout.dart';
import 'package:intl/intl.dart';

class ClientApiService {
  static String formatDate(DateTime date) =>
      DateFormat('yyyy-MM-dd').format(date);

  static Future<Map<String, dynamic>?> fetchDietPlan() async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/dietplans/me',
      method: 'GET',
    );

    if (response['statusCode'] == 200 && response['data'] is Map) {
      final plan = Map<String, dynamic>.from(response['data'] as Map);
      plan['meals'] = DietFoodMapper.normalizePlanMeals(plan['meals']);
      return plan;
    }
    return null;
  }

  static Future<bool> addMeal({
    required DateTime date,
    required String name,
    required String quantity,
    required num kcal,
    required num p,
    required num c,
    required num f,
    required String mealType,
    bool isVeg = true,
  }) async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/addmeal',
      method: 'POST',
      payload: {
        'mealDate': formatDate(date),
        'name': name,
        'quantity': quantity,
        'kcal': kcal,
        'p': p,
        'c': c,
        'f': f,
        'mealType': mealType,
        'isVeg': isVeg ? 1 : 0,
      },
    );
    return response['statusCode'] == 201 || response['statusCode'] == 200;
  }

  static Future<bool> deleteMeal(int mealId) async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/trackmeal',
      method: 'DELETE',
      payload: {'mealId': mealId},
    );
    return response['statusCode'] == 200;
  }

  static Future<List<FoodItemModel>> fetchDietTargetForDate(
    DateTime date,
  ) async {
    final plan = await fetchDietPlan();
    if (plan == null) return [];

    final meals = plan['meals'];
    if (meals is! List) return [];

    return DietFoodMapper.mealsForDay(meals, date);
  }

  static Future<List<FoodItemModel>> fetchConsumedMeals(
    DateTime date,
  ) async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/trackmeal',
      method: 'GET',
      queryParams: {'date': formatDate(date)},
    );

    if (response['statusCode'] != 200 || response['data'] is! Map) {
      return [];
    }

    final meals = (response['data'] as Map)['meals'];
    if (meals is! List) return [];

    return meals
        .whereType<Map>()
        .map((meal) => DietFoodMapper.fromTrackedMeal(
              Map<String, dynamic>.from(meal),
            ))
        .toList();
  }

  static Future<double> fetchConsumedKcal(DateTime date) async {
    final meals = await fetchConsumedMeals(date);
    return DietFoodMapper.totalKcal(meals);
  }

  static Future<double> fetchTargetKcal(DateTime date) async {
    final meals = await fetchDietTargetForDate(date);
    return DietFoodMapper.totalKcal(meals);
  }

  static Future<Map<String, dynamic>> fetchDailyTrack(DateTime date) async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/dailytrack',
      method: 'GET',
      queryParams: {'date': formatDate(date)},
    );

    if (response['statusCode'] == 200 && response['data'] is Map) {
      return Map<String, dynamic>.from(response['data'] as Map);
    }

    return {
      'sleepHours': 0,
      'waterIntake': 0,
      'steps': 0,
      'selectedDate': formatDate(date),
    };
  }

  static Future<bool> saveDailyTrack({
    required DateTime date,
    int? sleepHours,
    int? waterIntake,
    int? steps,
  }) async {
    final payload = <String, dynamic>{
      'selectedDate': formatDate(date),
    };
    if (sleepHours != null) payload['sleepHours'] = sleepHours;
    if (waterIntake != null) payload['waterIntake'] = waterIntake;
    if (steps != null) payload['steps'] = steps;

    final response = await ApiUtil.makeApiCall(
      endpoint: '/dailytrack',
      method: 'POST',
      payload: payload,
    );

    return response['statusCode'] == 200 || response['statusCode'] == 201;
  }

  /// Exercises assigned to this client by their nutritionist (mobile Exercises tab).
  static Future<List<Workout>> fetchAssignedExercises() async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/client/exercises/assigned',
      method: 'GET',
    );

    if (response['statusCode'] != 200 || response['data'] is! Map) {
      return [];
    }

    final assignments = (response['data'] as Map)['assignments'];
    if (assignments is! List) return [];

    return assignments.whereType<Map>().map((row) {
      final map = Map<String, dynamic>.from(row);
      return Workout(
        title: map['exerciseName']?.toString() ?? 'Exercise',
        type: map['type']?.toString() ?? 'Workout',
        sets: map['muscleType']?.toString() ?? '',
        imageUrl: map['videoLink']?.toString().isNotEmpty == true
            ? map['videoLink'].toString()
            : 'assets/images/flutter_logo.png',
        scheduledDate: map['date']?.toString(),
        workoutSteps: map['workoutSteps']?.toString(),
      );
    }).toList();
  }

  static Future<Map<String, dynamic>?> fetchNutritionist() async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/client/nutritionist',
      method: 'GET',
    );

    if (response['statusCode'] == 200 && response['data'] is Map) {
      return Map<String, dynamic>.from(response['data'] as Map);
    }
    return null;
  }

  static Future<List<Map<String, dynamic>>> fetchAvailableSlots(DateTime date) async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/client/slots/${formatDate(date)}',
      method: 'GET',
    );

    if (response['statusCode'] != 200 || response['data'] is! Map) {
      return [];
    }

    final slots = (response['data'] as Map)['slots'];
    if (slots is! List) return [];

    return slots.whereType<Map>().map((slot) {
      final time = slot['SlotTime']?.toString() ?? '';
      return {
        'slot_id': slot['SlotID'],
        'time': time,
        'label': _formatSlotLabel(time),
      };
    }).where((slot) => slot['time'].toString().isNotEmpty).toList();
  }

  static String _formatSlotLabel(String rawTime) {
    final match = RegExp(r'^(\d{1,2}):(\d{2})').firstMatch(rawTime);
    if (match == null) return rawTime;

    final hours = int.parse(match.group(1)!);
    final minutes = match.group(2)!;
    final period = hours >= 12 ? 'PM' : 'AM';
    final hour12 = hours % 12 == 0 ? 12 : hours % 12;
    return '$hour12:$minutes $period';
  }

  static Future<bool> scheduleCall({
    required DateTime date,
    required int slotId,
    String? time,
  }) async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/call',
      method: 'POST',
      payload: {
        'scheduled_date': formatDate(date),
        'slot_id': slotId,
        if (time != null && time.isNotEmpty) 'scheduled_time': time,
      },
    );

    return response['statusCode'] == 201;
  }

  static Future<bool> cancelCall(String callId) async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/call/$callId',
      method: 'PUT',
      payload: {'status': 'cancelled'},
    );

    return response['statusCode'] == 200;
  }

  static Future<List<Map<String, dynamic>>> fetchScheduledCalls() async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/calls',
      method: 'GET',
    );

    if (response['statusCode'] != 200 || response['data'] is! Map) {
      return [];
    }

    final calls = (response['data'] as Map)['calls'];
    if (calls is! List) return [];

    return calls
        .whereType<Map>()
        .map((call) => Map<String, dynamic>.from(call))
        .toList();
  }

  static Future<Map<String, dynamic>?> fetchCallJoinInfo(String callId) async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/calls/$callId/join',
      method: 'GET',
    );

    if (response['statusCode'] == 200 && response['data'] is Map) {
      return Map<String, dynamic>.from(response['data'] as Map);
    }

    if (response['data'] is Map) {
      return Map<String, dynamic>.from(response['data'] as Map);
    }

    return null;
  }

  static Future<bool> updateUserData(Map<String, dynamic> payload) async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/userdata',
      method: 'POST',
      payload: payload,
    );

    return response['statusCode'] == 200 || response['statusCode'] == 201;
  }
}
