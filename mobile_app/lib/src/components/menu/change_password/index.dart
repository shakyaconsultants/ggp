import 'package:flutter/material.dart';
import 'package:good_gut/src/components/menu/change_password/password_form_card.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  _ChangePasswordScreenState createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final TextEditingController _currentPasswordController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  bool _currentPasswordVisible = false;
  bool _newPasswordVisible = false;
  bool _confirmPasswordVisible = false;

  // Handle the change password functionality
  void _handleChangePassword() {
    if (_formKey.currentState!.validate()) {
      // Perform password change logic
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password changed successfully')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        centerTitle: true,
        titleTextStyle: const TextStyle(
            color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold),
        title: const Text('Change Password'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              PasswordFormCard(
                currentPasswordController: _currentPasswordController,
                newPasswordController: _newPasswordController,
                confirmPasswordController: _confirmPasswordController,
                currentPasswordVisible: _currentPasswordVisible,
                newPasswordVisible: _newPasswordVisible,
                confirmPasswordVisible: _confirmPasswordVisible,
                toggleCurrentPasswordVisibility: () {
                  setState(() {
                    _currentPasswordVisible = !_currentPasswordVisible;
                  });
                },
                toggleNewPasswordVisibility: () {
                  setState(() {
                    _newPasswordVisible = !_newPasswordVisible;
                  });
                },
                toggleConfirmPasswordVisibility: () {
                  setState(() {
                    _confirmPasswordVisible = !_confirmPasswordVisible;
                  });
                },
                onChangePassword: _handleChangePassword, // Pass the callback here
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }
}

