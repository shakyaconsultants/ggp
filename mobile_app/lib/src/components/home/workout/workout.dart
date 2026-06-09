class Workout {
  final String title;
  final String type;
  final String sets;
  final String imageUrl;
  final String? scheduledDate;
  final String? workoutSteps;

  Workout({
    required this.title,
    required this.type,
    required this.sets,
    required this.imageUrl,
    this.scheduledDate,
    this.workoutSteps,
  });

  factory Workout.fromJson(Map<String, dynamic> json) {
    return Workout(
      title: json['title'],
      type: json['type'],
      sets: json['sets'],
      imageUrl: json['imageUrl'],
      scheduledDate: json['scheduledDate'],
      workoutSteps: json['workoutSteps'],
    );
  }
}
