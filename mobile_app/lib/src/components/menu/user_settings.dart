import 'package:flutter/material.dart';
import 'package:good_gut/src/components/menu/account_settings/index.dart';
import 'package:good_gut/src/components/menu/change_password/index.dart';
import 'package:good_gut/src/components/menu/edit_profile.dart';
import 'package:good_gut/src/components/menu/view_profile.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class UserSettingScreen extends StatefulWidget {
  final Map<String, dynamic> userInfo;
  const UserSettingScreen({super.key, required this.userInfo});

  @override
  State<UserSettingScreen> createState() => _UserSettingScreenState();
}

class _UserSettingScreenState extends State<UserSettingScreen> {
  @override
  Widget build(BuildContext context) {
    final name = widget.userInfo['name']?.toString() ?? 'User';
    final initial = name.isNotEmpty ? name[0].toUpperCase() : '?';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: const Color(0xFFF07E28),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          color: Colors.white,
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        centerTitle: true,
        scrolledUnderElevation: 0,
        title: const Text(
          'Settings',
          style: TextStyle(
              fontSize: 20, color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: ListView(
        children: [
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.only(bottom: 20),
            child: Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: const Color(0xFFFDEED7),
                    child: Text(
                      initial,
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFF07E28),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Hey, $name',
                    style: const TextStyle(
                        fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 5),
                  Text(widget.userInfo['email']?.toString() ?? ''),
                ],
              ),
            ),
          ),
          _buildSettingsOption(
              icon: Icons.person_outline,
              title: 'View my profile',
              onTap: () {
                Navigator.push(
                  context,
                  SlideInRouter(screen: const ViewProfileScreen()),
                );
              }),
          _buildSettingsOption(
              icon: Icons.edit,
              title: 'Edit profile & preferences',
              onTap: () {
                Navigator.push(
                  context,
                  SlideInRouter(screen: const EditProfileScreen()),
                );
              }),
          _buildSettingsOption(
              icon: Icons.vpn_key,
              title: 'Reset Password',
              color: Colors.orange,
              onTap: () {
                Navigator.push(
                  context,
                  SlideInRouter(screen: const ChangePasswordScreen()),
                );
              }),
          _buildSettingsOption(
              icon: Icons.settings,
              title: 'Account settings',
              color: Colors.green,
              onTap: () {
                Navigator.push(
                  context,
                  SlideInRouter(screen: const AccountSettingsScreen()),
                );
              }),
        ],
      ),
    );
  }

  Widget _buildSettingsOption(
      {required IconData icon,
      required String title,
      Color? color,
      required Function onTap}) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color ?? Colors.grey,
        child: Icon(icon, color: Colors.white),
      ),
      title: Text(title),
      trailing: const Icon(Icons.arrow_forward_ios),
      onTap: onTap as void Function()?,
    );
  }
}
