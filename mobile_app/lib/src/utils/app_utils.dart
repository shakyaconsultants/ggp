import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/components/login.dart';
import 'package:good_gut/src/utils/api_util.dart';
import 'package:good_gut/src/utils/slide_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/services.dart';

class Apputils {
  static Future<void> launchExternalURL(url) async {
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }

  static void showUpdateDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => WillPopScope(
        onWillPop: () async {
          // Prevent dialog dismissal on back button press
          return Future.value(false);
        },
        child: buildUpdateDialog(context),
      ),
    );
  }

  static Widget buildUpdateDialog(BuildContext context) {
    return AlertDialog(
      title: const Text(AppStrings.updateAvailable),
      content: const Text(AppStrings.updateMessage),
      actions: <Widget>[
        TextButton(
          onPressed: () {
            SystemNavigator.pop();
          },
          child: const Text(AppStrings.cancel),
        ),
        TextButton(
          onPressed: () {
            Apputils.launchExternalURL(AppStrings.playStoreURL);
          },
          child: const Text(AppStrings.update),
        ),
      ],
    );
  }

  static bool isVersionGreater(String version1, String version2) {
    List<String> v1 = version1.split('.');
    List<String> v2 = version2.split('.');

    for (int i = 0; i < v1.length; i++) {
      int num1 = int.parse(v1[i]);
      int num2 = int.parse(v2[i]);

      if (num1 > num2) {
        return true;
      } else if (num1 < num2) {
        return false;
      }
    }

    // If all parts are equal, consider version2 as greater if it has more parts
    return v1.length < v2.length;
  }

  static Future<bool> checkForUpdate() async {
    final appVersion = await getAppVersion();
    final serverVersion = await getServerVersion();

    if (isVersionGreater(serverVersion, appVersion)) {
      return true;
    }
    return false;
  }

  static Future<String> getAppVersion() async {
    return "1.0.0";
  }

  static Future<String> getServerVersion() async {
    try {
      final response = await ApiUtil.makeApiCall(endpoint: AppStrings.versionUrl, method: 'GET');

      final json = response["data"];
      final version = json['version'].toString();
      return version;
    } catch (e) {
      debugPrint('Error fetching server version: $e');
      return "0.0.1";
    }
  }

  static void logOut(BuildContext context) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    // Use a delayed Future to navigate after clearing
    Future.delayed(Duration.zero, () {
      Navigator.pushAndRemoveUntil(
        context,
        SlideInRouter(screen: const LoginPage()),
        (route) => false,
      );
    });
  }

  static Future<Map<String, dynamic>> getUserMetaData(String token, BuildContext context) async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/usermeta',
      method: 'GET',
    );

    print(response);

    if (response['statusCode'] == 200) {
      return response['data'];
    } else if(response['statusCode'] == 401) {
      logOut(context);
      
      throw Exception('Unauthorized');
    } else {
      //  logOut(context);
      throw Exception('Failed to fetch user metadata');
    }
  }

   static void showErrorMessage(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
