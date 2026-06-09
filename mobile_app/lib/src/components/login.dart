import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/home/index.dart';
import 'package:good_gut/src/components/onboarding/index.dart';
import 'package:good_gut/src/utils/api_util.dart';
import 'package:good_gut/src/utils/app_utils.dart';
import 'package:good_gut/src/utils/slide_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final ValueNotifier<bool> _isLoading = ValueNotifier(false);

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _isLoading.dispose();
    super.dispose();
  }

  String? _validateEmail(String? email) {
    if (email == null || email.isEmpty) {
      return 'Email is required';
    }
    final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+');
    if (!emailRegex.hasMatch(email)) {
      return 'Enter a valid email';
    }
    return null;
  }

  String? _validatePassword(String? password) {
    if (password == null || password.isEmpty) {
      return 'Password is required';
    }
    return null;
  }

  Future<void> _loginWithEmail(BuildContext context) async {
    if (_formKey.currentState?.validate() ?? false) {
      _isLoading.value = true; // Start loading
      try {
        Map<String, dynamic> response = await ApiUtil.makeApiCall(
          endpoint: '/login', // Update with the actual login endpoint
          method: 'POST',
          payload: {
            'email': _emailController.text,
            'password': _passwordController.text,
          },
        );

        print(response);

        if (response["statusCode"] == 200) {
          final responseData = response["data"];

          String token = responseData['token'];

          await _storeLoginInfo(token);

          Map<String, dynamic> userInfo =
              await Apputils.getUserMetaData(token, context);

          await _storeUserInfo(userInfo);

          if (userInfo["onboarded"] == 1) {
            Navigator.pushReplacement(
              context,
              SlideInRouter(screen: const HomePage()),
            );
          } else {
            Navigator.pushReplacement(
              context,
              SlideInRouter(screen: const OnboardingFlow()),
            );
          }

        } else if (response["statusCode"] == 403) {
          String message =
              "Your Account is not active yet. Please verify your email.";
          try {
            final errBody = response["error"];
            if (errBody is String && errBody.isNotEmpty) {
              final parsed = jsonDecode(errBody);
              if (parsed is Map) {
                if (parsed["code"] == "PRACTICE_SUBSCRIPTION_INACTIVE") {
                  message = parsed["msg"] ??
                      "Your nutritionist's practice subscription is inactive. Please contact your nutritionist.";
                } else if (parsed["msg"] != null) {
                  message = parsed["msg"].toString();
                }
              }
            }
          } catch (_) {}
          _showErrorMessage(context, message);
        } else if (response["statusCode"] == 401) {
          _showErrorMessage(
              context, "Invalid email or password. Please try again.");
        } else if (response["statusCode"] == 404) {
          print(response);
          _showErrorMessage(
              context,
              "No account found. Ask your nutritionist to register you on Good Gut Product.");
        } else {
          _showErrorMessage(context, "Login failed. Please try again.");
        }
      } catch (e) {
        print(e);
        _showErrorMessage(
            context, "An error occurred. Please try again., ${e}");
      } finally {
        _isLoading.value = false; // Stop loading
      }
    } else {
      debugPrint("Validation failed");
    }
  }

  void _showErrorMessage(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  Future<void> _storeLoginInfo(String token) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setBool('isLoggedIn', true);
  }

  Future<void> _storeUserInfo(Map<String, dynamic> userInfo) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_info', jsonEncode(userInfo));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFFF07E28),
        centerTitle: true,
        title: Image.asset(
          'assets/images/ggp_logo_flat.png',
          height: 60,
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Form(
          key: _formKey,
          child: ValueListenableBuilder<bool>(
            valueListenable: _isLoading,
            builder: (context, isLoading, child) {
              return Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    "Welcome Back!",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Login to continue",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Accounts are created by your nutritionist.\nUse the email and password they provide.",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                  const SizedBox(height: 32),

                  // Email Field
                  TextFormField(
                    controller: _emailController,
                    decoration: InputDecoration(
                      labelText: "Email",
                      prefixIcon: const Icon(Icons.person),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    validator: _validateEmail,
                  ),
                  const SizedBox(height: 16),

                  // Password Field
                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: "Password",
                      prefixIcon: const Icon(Icons.lock),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    validator: _validatePassword,
                  ),
                  const SizedBox(height: 16),

                  // Login Button
                  isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : GGPButton(
                          onPressed: () => _loginWithEmail(context),
                          text: "Login",
                        ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
