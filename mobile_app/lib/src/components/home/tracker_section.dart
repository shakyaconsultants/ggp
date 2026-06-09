import 'package:flutter/material.dart';
import 'package:good_gut/src/components/home/sleep_card.dart';
import 'package:good_gut/src/components/home/steps_tracker_card.dart';
import 'package:good_gut/src/components/home/water_card.dart';
import 'package:good_gut/src/components/home/workout/workout_tracker_card.dart';
import 'package:good_gut/src/services/client_api_service.dart';

class TrackerSection extends StatefulWidget {
  final DateTime selectedDate;

  const TrackerSection({super.key, required this.selectedDate});

  @override
  State<TrackerSection> createState() => _TrackerSectionState();
}

class _TrackerSectionState extends State<TrackerSection> {
  int waterIntake = 0;
  int totalWaterIntake = 10;
  int sleepHours = 0;
  int totalSleepHours = 8;
  int steps = 0;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadTrackers();
  }

  @override
  void didUpdateWidget(covariant TrackerSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedDate != widget.selectedDate) {
      _loadTrackers();
    }
  }

  Future<void> _loadTrackers() async {
    setState(() => loading = true);
    final data = await ClientApiService.fetchDailyTrack(widget.selectedDate);
    if (!mounted) return;
    setState(() {
      waterIntake = _toInt(data['waterIntake']);
      sleepHours = _toInt(data['sleepHours']);
      steps = _toInt(data['steps']);
      loading = false;
    });
  }

  int _toInt(dynamic value) => int.tryParse(value?.toString() ?? '0') ?? 0;

  Future<void> _persistTrackers() async {
    await ClientApiService.saveDailyTrack(
      date: widget.selectedDate,
      sleepHours: sleepHours,
      waterIntake: waterIntake,
      steps: steps,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Other Trackers',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Expanded(
                  child: WorkoutTrackerCard(
                    title: "Track your workout",
                    subTitle: "Assigned by your nutritionist",
                    progress: 0,
                  ),
                ),
                Expanded(
                  child: StepsTrackerCard(
                    title: "Track your steps",
                    subTitle: loading ? 'Loading...' : '$steps steps logged',
                    steps: steps,
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(
                  child: WaterIntakeCard(
                    currentWaterIntake: waterIntake,
                    totalWaterGoal: totalWaterIntake,
                    onIncrease: () {
                      setState(() {
                        if (waterIntake < totalWaterIntake) waterIntake++;
                      });
                      _persistTrackers();
                    },
                    onDecrease: () {
                      setState(() {
                        if (waterIntake > 0) waterIntake--;
                      });
                      _persistTrackers();
                    },
                  ),
                ),
                Expanded(
                    child: SleepTrackerCard(
                  currentSleepHours: sleepHours,
                  totalSleepGoal: totalSleepHours,
                  onIncrease: () {
                    setState(() {
                      if (sleepHours < totalSleepHours) sleepHours++;
                    });
                    _persistTrackers();
                  },
                  onDecrease: () {
                    setState(() {
                      if (sleepHours > 0) sleepHours--;
                    });
                    _persistTrackers();
                  },
                )),
              ],
            ),
          ],
        ));
  }
}
