import 'package:flutter/material.dart';
import 'package:good_gut/src/components/diet_screen/consumed_section.dart';
import 'package:good_gut/src/components/diet_screen/log_meal_screen.dart';
import 'package:good_gut/src/components/diet_screen/my_diet_plan_section.dart';
import 'package:good_gut/src/components/home/date_selector.dart';
import 'package:good_gut/src/components/menu/index.dart';
import 'package:good_gut/src/navigation/main_tab_scope.dart';
import 'package:good_gut/src/utils/diet_food_mapper.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class DietHubScreen extends StatefulWidget {
  const DietHubScreen({super.key});

  @override
  State<DietHubScreen> createState() => _DietHubScreenState();
}

class _DietHubScreenState extends State<DietHubScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  DateTime selectedDate = DateTime.now();
  int selectedPlanDay = DietFoodMapper.backendDayOfWeek(DateTime.now());
  int consumedRefreshKey = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) return;
      setState(() {});
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _openLogMeal() async {
    await Navigator.push(
      context,
      SlideInRouter(
        screen: LogMealScreen(
          selectedDate: selectedDate,
          onSaved: () => setState(() => consumedRefreshKey++),
        ),
      ),
    );
    if (mounted) setState(() => consumedRefreshKey++);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFFF07E28),
        foregroundColor: Colors.white,
        title: const Text(
          'My Diet',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.home_outlined),
          tooltip: 'Home',
          onPressed: () => MainTabScope.goHome(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Navigator.push(
              context,
              SlideInRouter(screen: const MenuScreen()),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: 'Assigned Plan'),
            Tab(text: 'Logged Meals'),
          ],
        ),
      ),
      body: Column(
        children: [
          DateSelector(
            selectedDate: selectedDate,
            onDateChanged: (date) {
              setState(() {
                selectedDate = date;
                selectedPlanDay = DietFoodMapper.backendDayOfWeek(date);
              });
            },
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                MyDietPlanSection(
                  selectedDayOfWeek: selectedPlanDay,
                  onDayChanged: (day) =>
                      setState(() => selectedPlanDay = day),
                ),
                ConsumedSection(
                  key: ValueKey('consumed-$consumedRefreshKey-${selectedDate.toIso8601String()}'),
                  selectedDate: selectedDate,
                  onMealsChanged: () =>
                      setState(() => consumedRefreshKey++),
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: _tabController.index == 1
          ? FloatingActionButton.extended(
              onPressed: _openLogMeal,
              backgroundColor: const Color(0xFFF07E28),
              icon: const Icon(Icons.add),
              label: const Text('Log meal'),
            )
          : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}
