import 'package:flutter/material.dart';
import 'package:good_gut/src/components/appointment_screen/appointment.dart';
import 'package:good_gut/src/components/chat_screen/index.dart';
import 'package:good_gut/src/components/diet_screen/diet_hub_screen.dart';
import 'package:good_gut/src/components/home/index.dart';
import 'package:good_gut/src/components/home/workout/index.dart';
import 'package:good_gut/src/components/shop_screen/index.dart';
import 'package:good_gut/src/components/support_screen/index.dart';
import 'package:good_gut/src/navigation/main_tab_scope.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  final GlobalKey<WorkoutSelectedScreenState> _workoutTabKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    MainTabNavigation.register(_openTab);
  }

  @override
  void dispose() {
    MainTabNavigation.unregister(_openTab);
    super.dispose();
  }

  void _openTab(int index) {
    setState(() => _currentIndex = index);
    if (index == 4) {
      _workoutTabKey.currentState?.loadWorkouts();
    }
  }

  late final List<Widget> _pages = [
    HomePage(onOpenDiet: () => _openTab(1)),
    const DietHubScreen(),
    const ChatScreen(),
    const AppointmentScreen(),
    WorkoutSelectedScreen(key: _workoutTabKey, embeddedInTab: true),
    const ShopScreen(),
    const SupportScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: _pages,
        ),
        bottomNavigationBar: BottomNavigationBar(
          backgroundColor: Colors.white,
          type: BottomNavigationBarType.fixed,
          currentIndex: _currentIndex,
          onTap: _openTab,
          showSelectedLabels: true,
          showUnselectedLabels: true,
          unselectedIconTheme: const IconThemeData(color: Colors.grey),
          selectedLabelStyle:
              const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
          selectedItemColor: const Color(0xFFF07E28),
          unselectedItemColor: Colors.black,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.restaurant_menu_outlined),
              activeIcon: Icon(Icons.restaurant_menu),
              label: 'Diet',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.chat_outlined),
              activeIcon: Icon(Icons.chat),
              label: 'Chat',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.calendar_month_outlined),
              activeIcon: Icon(Icons.calendar_month),
              label: 'Calls',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.fitness_center_outlined),
              activeIcon: Icon(Icons.fitness_center),
              label: 'Exercises',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.trolley),
              activeIcon: Icon(Icons.trolley),
              label: 'Shop',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.support_outlined),
              activeIcon: Icon(Icons.support),
              label: 'Support',
            ),
          ],
        ),
    );
  }
}
