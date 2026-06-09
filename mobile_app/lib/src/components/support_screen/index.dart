import 'package:flutter/material.dart';
import 'package:good_gut/src/components/menu/index.dart';
import 'package:good_gut/src/components/support_screen/faq.dart';
import 'package:good_gut/src/components/support_screen/support.dart';
import 'package:good_gut/src/navigation/main_tab_scope.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  _SupportScreenState createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        _dismissKeyboard();
      }
    });
  }

  void _dismissKeyboard() {
    FocusScope.of(context).unfocus();
  }

  @override
  void dispose() {
    _tabController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        centerTitle: true,
        backgroundColor: const Color(0xFFF07E28),
        title: const Text("Help & Support"),
        titleTextStyle: const TextStyle(
            color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
        leading: IconButton(
          icon: const Icon(Icons.home_outlined, color: Colors.white),
          tooltip: 'Home',
          onPressed: () => MainTabScope.goHome(context),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.search, color: Colors.white,), onPressed: () {}),
          IconButton(
            icon: const Icon(Icons.menu, color: Colors.white),
            onPressed: () {
              Navigator.push(
                context,
                SlideInRouter(screen: const MenuScreen()),
              );
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'FAQ'),
            Tab(text: 'Support'),
          ],
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          dividerColor: Colors.white,
          unselectedLabelColor: Colors.white,
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          FaqSection(),
          SupportSection(),
        ],
      ),
    );
  }
}
