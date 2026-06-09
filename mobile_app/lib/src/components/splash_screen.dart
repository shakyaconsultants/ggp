import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:good_gut/src/components/home_screen.dart';
import 'package:good_gut/src/components/login.dart';
import 'package:good_gut/src/components/onboarding/index.dart';
import 'package:good_gut/src/utils/app_utils.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();

    Timer(const Duration(seconds: 0), () async {
      bool checkif = await Apputils.checkForUpdate();
      if (!mounted) return;
      if (checkif == true) {
        Apputils.showUpdateDialog(context);
      } else {
        final prefs = await SharedPreferences.getInstance();
        final isLoggedIn = prefs.getBool('isLoggedIn');
        debugPrint('isLoggedIn: $isLoggedIn');
        if (isLoggedIn == true) {
          final token = prefs.getString('auth_token') ?? '';
          Map<String, dynamic> userInfo = await Apputils.getUserMetaData(token, context);

          if (userInfo["practice_active"] == false) {
            await prefs.setBool('isLoggedIn', false);
            await prefs.remove('auth_token');
            await prefs.remove('user_info');
            if (!mounted) return;
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (context) => const LoginPage()),
            );
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  "Your nutritionist's practice subscription is inactive. Please contact your nutritionist.",
                ),
              ),
            );
            return;
          }

          await prefs.setString('user_info', jsonEncode(userInfo));

          if(userInfo["onboarded"] == 1) {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (context) => const HomeScreen()));
          } else {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (context) => const OnboardingFlow()));
          }
         
        } else {
          Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (context) => const LoginPage()));
        }
      }
    });

    // _getPermission();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF07E28),
      body: Center(
        child: Image.asset(
          'assets/images/ggp_logo.png',
          width: 250,
        ),
      ),
    );
  }
}
