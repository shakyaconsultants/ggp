import 'package:flutter/material.dart';
import 'package:good_gut/src/components/home/date_selector.dart';
import 'package:good_gut/src/components/home/health_card.dart';
import 'package:good_gut/src/components/home/hero_carousel.dart';
import 'package:good_gut/src/components/home/nutritionist_card.dart';
import 'package:good_gut/src/components/home/tracker_section.dart';
import 'package:good_gut/src/components/home/weight_card.dart';
import 'package:good_gut/src/components/menu/index.dart';
import 'package:good_gut/src/navigation/main_tab_scope.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class HomePage extends StatefulWidget {
  final VoidCallback? onOpenDiet;

  const HomePage({super.key, this.onOpenDiet});

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  DateTime selectedDate = DateTime.now();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
         backgroundColor: const Color(0xFFF07E28),
        title: const Text(
          'Good Gut',
          style: TextStyle(
              fontSize: 20, color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Colors.white),
          onPressed: () {
            Navigator.push(
              context,
              SlideInRouter(screen: const MenuScreen()),
            );
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.home_outlined, color: Colors.white),
            tooltip: 'Home',
            onPressed: () => MainTabScope.goHome(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            DateSelector(
              selectedDate: selectedDate,
              onDateChanged: (newDate) {
                setState(() {
                  selectedDate = newDate;
                });
              },
            ),
            const SizedBox(height: 20),
            const HeroCarousel(),
            const SizedBox(height: 16),
            const NutritionistCard(),
            const SizedBox(height: 20),
            HealthCard(
              selectedDate: selectedDate,
              onDateChanged: (newDate) {
                setState(() {
                  selectedDate = newDate;
                });
              },
              onOpenDiet: widget.onOpenDiet,
            ),
            const SizedBox(height: 16),
            const WeightCard(),
            const SizedBox(height: 16),
            TrackerSection(selectedDate: selectedDate),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
