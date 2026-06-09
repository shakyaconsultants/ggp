import 'package:flutter/material.dart';
import 'package:good_gut/src/components/chat_screen/community_section.dart';
import 'package:good_gut/src/components/chat_screen/trainer_section.dart';
import 'package:good_gut/src/components/menu/index.dart';
import 'package:good_gut/src/navigation/main_tab_scope.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen>
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
        title: const Text("Chat"),
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
            Tab(text: 'My nutritionist'),
            Tab(text: 'Community'),
          ],
          indicatorColor: Colors.white,
          dividerColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white,
          
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          TrainerSection(),
          CommunitySection(),
        ],
      ),
    );
  }
}
