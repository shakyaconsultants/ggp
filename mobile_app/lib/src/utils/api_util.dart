import 'dart:convert';
import 'package:good_gut/src/app_strings.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiUtil {
  static const String baseUrl = AppStrings.apiURL;

  static Future<Map<String, dynamic>> makeApiCall({
    required String endpoint,
    required String method,
    Map<String, String>? headers,
    Map<String, dynamic>? queryParams,
    dynamic payload,
  }) async {
    Uri url = Uri.parse('$baseUrl$endpoint');
    if (queryParams != null && queryParams.isNotEmpty) {
      url = url.replace(queryParameters: queryParams);
    }

    headers ??= {
      'Content-Type': 'application/json',
    };

    String? token = await _getAuthToken();
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    try {
      http.Response response;

      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(url, headers: headers);
          break;
        case 'POST':
          response =
              await http.post(url, headers: headers, body: jsonEncode(payload));
          break;
        case 'PUT':
          response =
              await http.put(url, headers: headers, body: jsonEncode(payload));
          break;
        case 'DELETE':
          response = await http.delete(
            url,
            headers: headers,
            body: payload != null ? jsonEncode(payload) : null,
          );
          break;
        default:
          throw Exception('Unsupported HTTP method: $method');
      }
      print(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return _handleSuccessResponse(response);
      } else {
        return _handleErrorResponse(response);
      }
    } catch (e) {
      return {
        'status': 'error',
        'message': 'An error occurred: $e',
      };
    }
  }

  static Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<String?> getAuthToken() => _getAuthToken();

  static Map<String, dynamic> _handleSuccessResponse(http.Response response) {
    try {
      // ignore: prefer_is_empty
      if (response.body.isNotEmpty) {
        final dynamic decodedBody = jsonDecode(response.body);
        print(decodedBody);

        if (decodedBody is List) {
          // Handle case when the response is a List of JSON
          return {
            'statusCode': response.statusCode,
            'status': 'success',
            'data': decodedBody, // List of JSON
            'type': 'list', // Additional metadata for type
          };
        } else if (decodedBody is Map) {
          // Handle case when the response is a single JSON object
          return {
            'statusCode': response.statusCode,
            'status': 'success',
            'data': decodedBody, // Single JSON object
            'type': 'object', // Additional metadata for type
          };
        } else {
          // Unexpected data type
          return {
            'statusCode': response.statusCode,
            'status': 'error',
            'message': 'Unexpected data type in response',
          };
        }
      } else {
        // Handle empty response body
        return {
          'statusCode': response.statusCode,
          'status': 'error',
          'message': 'Empty response body',
        };
      }
    } catch (e) {
      return {
        'status': 'error',
        'statusCode': response.statusCode,
        'message': 'Failed to parse response: $e',
      };
    }
  }

  static Map<String, dynamic> _handleErrorResponse(http.Response response) {
    return {
      'statusCode': response.statusCode,
      'status': 'error',
      'message': 'Request failed with status: ${response.statusCode}',
      'error': response.body,
    };
  }
}
