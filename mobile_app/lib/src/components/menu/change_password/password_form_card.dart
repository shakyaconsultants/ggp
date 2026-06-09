import 'package:flutter/material.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';

class PasswordFormCard extends StatelessWidget {
  final TextEditingController currentPasswordController;
  final TextEditingController newPasswordController;
  final TextEditingController confirmPasswordController;

  final bool currentPasswordVisible;
  final bool newPasswordVisible;
  final bool confirmPasswordVisible;

  final VoidCallback toggleCurrentPasswordVisibility;
  final VoidCallback toggleNewPasswordVisibility;
  final VoidCallback toggleConfirmPasswordVisibility;
  final VoidCallback onChangePassword; // Callback for button action

  const PasswordFormCard({super.key, 
    required this.currentPasswordController,
    required this.newPasswordController,
    required this.confirmPasswordController,
    required this.currentPasswordVisible,
    required this.newPasswordVisible,
    required this.confirmPasswordVisible,
    required this.toggleCurrentPasswordVisibility,
    required this.toggleNewPasswordVisibility,
    required this.toggleConfirmPasswordVisibility,
    required this.onChangePassword,
  });

  // Custom password validation function
  String? _validatePassword(String? value, {bool isNewPassword = false}) {
    if (value == null || value.isEmpty) {
      return 'Please enter a password';
    }
    if (isNewPassword && value.length < 8) {
      return 'New password must be at least 8 characters long';
    }
    return null;
  }

  // Confirm password validation
  String? _validateConfirmPassword(String? value) {
    if (value != newPasswordController.text) {
      return 'Passwords do not match';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.symmetric(horizontal: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: Colors.grey, width: 0.2),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          children: [
            const SizedBox(height: 24),
            _buildPasswordField(
              label: 'Current Password',
              controller: currentPasswordController,
              isVisible: currentPasswordVisible,
              toggleVisibility: toggleCurrentPasswordVisibility,
              validator: _validatePassword,
            ),
            const SizedBox(height: 24),
            _buildPasswordField(
              label: 'New Password',
              controller: newPasswordController,
              isVisible: newPasswordVisible,
              toggleVisibility: toggleNewPasswordVisibility,
              validator: (value) => _validatePassword(value, isNewPassword: true),
            ),
            const SizedBox(height: 24),
            _buildPasswordField(
              label: 'Confirm New Password',
              controller: confirmPasswordController,
              isVisible: confirmPasswordVisible,
              toggleVisibility: toggleConfirmPasswordVisibility,
              validator: _validateConfirmPassword,
            ),
            const SizedBox(height: 24),
            GGPButton(
              onPressed: onChangePassword, // Call the passed function here
              text: "Change Password",
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // Reusable password field
  Widget _buildPasswordField({
    required String label,
    required TextEditingController controller,
    required bool isVisible,
    required VoidCallback toggleVisibility,
    required String? Function(String?) validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: !isVisible,
      cursorColor: Colors.black,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.black),
        suffixIcon: IconButton(
          icon: Icon(isVisible ? Icons.visibility : Icons.visibility_off),
          onPressed: toggleVisibility,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.black, width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.grey, width: 0.2),
        ),
      ),
      validator: validator,
    );
  }
}
