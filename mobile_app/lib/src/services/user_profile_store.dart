import 'dart:convert';

import 'package:good_gut/src/utils/api_util.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserProfileStore {
  static const _userInfoKey = 'user_info';

  static Future<Map<String, dynamic>> loadCached() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_userInfoKey);
    if (raw == null || raw.isEmpty) {
      return {};
    }
    try {
      final decoded = jsonDecode(raw);
      if (decoded is Map) {
        return Map<String, dynamic>.from(decoded);
      }
    } catch (_) {}
    return {};
  }

  static Future<void> save(Map<String, dynamic> userInfo) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userInfoKey, jsonEncode(userInfo));
  }

  static Future<Map<String, dynamic>> refreshFromApi() async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/usermeta',
      method: 'GET',
    );

    if (response['statusCode'] == 200 && response['data'] is Map) {
      final data = Map<String, dynamic>.from(response['data'] as Map);
      await save(data);
      return data;
    }

    return loadCached();
  }
}
