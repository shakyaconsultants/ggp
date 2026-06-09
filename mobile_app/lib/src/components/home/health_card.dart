import 'package:flutter/material.dart';
import 'package:good_gut/src/services/client_api_service.dart';

class HealthCard extends StatefulWidget {
  final DateTime selectedDate;
  final Function(DateTime) onDateChanged;
  final VoidCallback? onOpenDiet;

  const HealthCard({
    super.key,
    required this.selectedDate,
    required this.onDateChanged,
    this.onOpenDiet,
  });

  @override
  State<HealthCard> createState() => _HealthCardState();
}

class _HealthCardState extends State<HealthCard> {
  double consumedKcal = 0;
  double targetKcal = 0;
  bool loading = true;
  bool hasPlan = false;

  @override
  void initState() {
    super.initState();
    _loadSummary();
  }

  @override
  void didUpdateWidget(covariant HealthCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedDate != widget.selectedDate) {
      _loadSummary();
    }
  }

  Future<void> _loadSummary() async {
    setState(() => loading = true);
    final consumed =
        await ClientApiService.fetchConsumedKcal(widget.selectedDate);
    final target = await ClientApiService.fetchTargetKcal(widget.selectedDate);
    final plan = await ClientApiService.fetchDietPlan();
    if (!mounted) return;
    setState(() {
      consumedKcal = consumed;
      targetKcal = target > 0 ? target : 2400;
      hasPlan = plan != null;
      loading = false;
    });
  }

  void _openDiet() {
    if (widget.onOpenDiet != null) {
      widget.onOpenDiet!();
    }
  }

  @override
  Widget build(BuildContext context) {
    final remaining = (targetKcal - consumedKcal).clamp(0, targetKcal);
    final progress =
        targetKcal > 0 ? (consumedKcal / targetKcal).clamp(0.0, 1.0) : 0.0;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Track Your Health',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: _openDiet,
            child: Card(
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: Colors.grey, width: 0.2),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          hasPlan ? 'My diet plan' : 'Log food',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFF07E28),
                          ),
                        ),
                        const Spacer(),
                        if (hasPlan)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFDEED7),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'Assigned',
                              style: TextStyle(
                                fontSize: 11,
                                color: Color(0xFFF07E28),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        const Icon(
                          Icons.arrow_forward_ios,
                          color: Color(0xFFF07E28),
                          size: 14,
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Text(
                          loading
                              ? 'Loading...'
                              : '${consumedKcal.toStringAsFixed(0)} kcal consumed',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF486A21),
                          ),
                        ),
                        const Spacer(),
                        Text(
                          loading
                              ? ''
                              : hasPlan
                                  ? '${targetKcal.toStringAsFixed(0)} kcal plan'
                                  : '${remaining.toStringAsFixed(0)} kcal remaining',
                          style: const TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    LinearProgressIndicator(
                      value: loading ? 0 : progress,
                      backgroundColor: Colors.grey[300],
                      valueColor:
                          const AlwaysStoppedAnimation<Color>(Colors.green),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      hasPlan
                          ? 'Tap to view assigned plan & log meals'
                          : 'Open Diet tab to log meals',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
