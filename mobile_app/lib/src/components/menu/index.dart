import 'package:flutter/material.dart';
import 'package:good_gut/src/components/nutritionist/know_your_nutritionist_screen.dart';
import 'package:good_gut/src/components/menu/view_profile.dart';
import 'package:good_gut/src/components/menu/privacy_policy.dart';
import 'package:good_gut/src/components/menu/terms.dart';
import 'package:good_gut/src/components/menu/user_settings.dart';
import 'package:good_gut/src/components/shop_screen/my_orders.dart';
import 'package:good_gut/src/navigation/main_tab_scope.dart';
import 'package:good_gut/src/services/user_profile_store.dart';
import 'package:good_gut/src/utils/app_utils.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  _MenuScreenState createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {

  Map<String, dynamic> userInfo = {};

  void getUserData() async {
    final profile = await UserProfileStore.refreshFromApi();
    if (!mounted) return;
    setState(() {
      userInfo = profile;
    });
  }

 @override
  void initState() {
    super.initState();
    getUserData();
  }



  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFFF07E28),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white,),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        centerTitle: true,
        scrolledUnderElevation: 0,
        title: const Text('Menu',  style: TextStyle(
              fontSize: 20, color: Colors.white, fontWeight: FontWeight.bold),),
        // backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile section (not in a card)
            const SizedBox(height: 20),
            Card(
              color: Colors.white,
              margin: const EdgeInsets.symmetric(horizontal: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: const BorderSide(color: Colors.grey, width: 0.2),
              ),
              child: Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Column(children: [
                   ListTile(
                    leading: const CircleAvatar(
                      radius: 30,
                      backgroundImage: NetworkImage(
                          'https://marketplace.canva.com/EAFXS8-cvyQ/1/0/1600w/canva-brown-and-light-brown%2C-circle-framed-instagram-profile-picture-2PE9qJLmPac.jpg'), // Replace with actual image URL
                    ),
                    title: Text(
                      'Hey, ${userInfo["name"]}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                  buildMenuTile(Icons.home_outlined, 'Home',
                      'Back to dashboard', onTap: () {
                    MainTabNavigation.goHome(context);
                  }),
                  buildMenuTile(Icons.restaurant_menu, 'My Diet Plan',
                      'Assigned plan from your nutritionist', onTap: () {
                    MainTabNavigation.navigateToTab(context, 1);
                  }),
                  buildMenuTile(Icons.person_outline, 'View Profile',
                      'Your 9-step health profile', onTap: () {
                    Navigator.push(
                      context,
                      SlideInRouter(screen: const ViewProfileScreen()),
                    );
                  }),
                  buildMenuTile(Icons.medical_services_outlined,
                      'Know your nutritionist',
                      'Your assigned care provider', onTap: () {
                    Navigator.push(
                      context,
                      SlideInRouter(
                          screen: const KnowYourNutritionistScreen()),
                    );
                  }),
                  buildMenuTile(Icons.fitness_center_outlined, 'Exercises',
                      'Workouts assigned by nutritionist', onTap: () {
                    MainTabNavigation.navigateToTab(context, 4);
                  }),
                  buildMenuTile(Icons.settings_outlined, 'Settings',
                      'Personal details & account settings', onTap: () {
                    Navigator.push(
                      context,
                      SlideInRouter(screen:  UserSettingScreen(userInfo: userInfo,)),
                    );
                  }),
                ]),
              ),
            ),

            const SizedBox(height: 10),

            Card(
              color: Colors.white,
              margin: const EdgeInsets.symmetric(horizontal: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: const BorderSide(color: Colors.grey, width: 0.2),
              ),
              child: Column(
                children: [
                  buildMenuTile(Icons.shopping_cart_outlined, 'My Orders', '',
                      onTap: () {
                    Navigator.push(
                      context,
                      SlideInRouter(screen: const MyOrdersScreen()),
                    );
                  }),
                  buildMenuTile(Icons.star_border_outlined, 'Review', '',
                      onTap: () {}),
                  buildMenuTile(
                      Icons.description_outlined, 'Terms & Conditions', '',
                      onTap: () {
                    Navigator.push(
                      context,
                      SlideInRouter(screen: const TermsAndConditions()),
                    );
                  }),
                  buildMenuTile(
                      Icons.privacy_tip_outlined, 'Privacy Policy', '',
                      onTap: () {
                    Navigator.push(
                      context,
                      SlideInRouter(screen: const PrivacyPolicy()),
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Card for App version and Logout
            Card(
              color: Colors.white,
              margin: const EdgeInsets.symmetric(horizontal: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: const BorderSide(color: Colors.grey, width: 0.2),
              ),
              child: Column(
                children: [
                  buildMenuTile(Icons.phone_android, 'App Version: 5.9.0', '',
                      showLeading: false, onTap: () {}),
                  buildMenuTile(Icons.share, 'Share App', '',
                      showLeading: false, onTap: () {}),
                  buildMenuTile(Icons.logout, 'Logout', '', onTap: () {
                    Apputils.logOut(context);
                  }),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  ListTile buildMenuTile(IconData icon, String title, String subtitle,
      {bool showLeading = true, required Function onTap}) {
    return ListTile(
      onTap: onTap as void Function()?,
      leading: Icon(icon),
      title: Text(title),
      subtitle: subtitle.isNotEmpty ? Text(subtitle) : null,
      trailing: showLeading ? const Icon(Icons.arrow_forward_ios) : null,
    );
  }
}
