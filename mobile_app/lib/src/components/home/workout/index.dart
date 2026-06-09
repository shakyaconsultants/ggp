import 'package:flutter/material.dart';
import 'package:good_gut/src/components/home/workout/workout.dart';
import 'package:good_gut/src/components/home/workout/workout_card.dart';
import 'package:good_gut/src/services/client_api_service.dart';

class WorkoutSelectedScreen extends StatefulWidget {
  const WorkoutSelectedScreen({super.key, this.embeddedInTab = false});

  final bool embeddedInTab;

  @override
  State<WorkoutSelectedScreen> createState() => WorkoutSelectedScreenState();
}

class WorkoutSelectedScreenState extends State<WorkoutSelectedScreen> {
  List<Workout> workouts = [];
  bool loading = true;
  String? emptyMessage;

  @override
  void initState() {
    super.initState();
    loadWorkouts();
  }

  Future<void> loadWorkouts() async {
    setState(() {
      loading = true;
      emptyMessage = null;
    });

    final items = await ClientApiService.fetchAssignedExercises();
    if (!mounted) return;
    setState(() {
      workouts = items;
      loading = false;
      if (items.isEmpty) {
        emptyMessage =
            'No exercises assigned yet. Your nutritionist can add and assign workouts from the portal.';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: !widget.embeddedInTab,
        leading: widget.embeddedInTab
            ? null
            : IconButton(
                icon: const Icon(Icons.arrow_back_ios),
                onPressed: () => Navigator.pop(context),
              ),
        centerTitle: true,
        titleTextStyle: const TextStyle(
            color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold),
        title: const Text('Exercises'),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: loading ? null : loadWorkouts,
          ),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: loadWorkouts,
              child: Column(
                children: [
                  Card(
                    color: const Color.fromRGBO(255, 255, 255, 1),
                    margin: const EdgeInsets.symmetric(horizontal: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: const BorderSide(color: Colors.grey, width: 0.2),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      child: Row(
                        children: [
                          Container(
                            width: 60,
                            height: 60,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(0xFFFDEED7),
                            ),
                            child: const Icon(Icons.fitness_center,
                                color: Color(0xFFF07E28)),
                          ),
                          const SizedBox(width: 16),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Assigned exercises',
                                  style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'Curated by your nutritionist',
                                  style: TextStyle(
                                      fontSize: 14, color: Colors.grey),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (emptyMessage != null)
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Text(
                        emptyMessage!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.grey),
                      ),
                    ),
                  Expanded(
                    child: ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      itemCount: workouts.length,
                      itemBuilder: (context, index) {
                        return WorkoutCard(
                          workout: workouts[index],
                          isSelectionScreen: false,
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
