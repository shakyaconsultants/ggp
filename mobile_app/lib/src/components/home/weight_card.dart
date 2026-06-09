import 'package:flutter/material.dart';
import 'package:good_gut/src/components/body_composition.dart';
import 'package:good_gut/src/services/user_profile_store.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class WeightCard extends StatefulWidget {
  const WeightCard({super.key});

  @override
  State<WeightCard> createState() => _WeightCardState();
}

class _WeightCardState extends State<WeightCard> {
  double weight = 0;
  double targetWeight = 0;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final profile = await UserProfileStore.refreshFromApi();
    if (!mounted) return;
    setState(() {
      weight = _toDouble(profile['weight']);
      targetWeight = _toDouble(profile['targetWeight']);
      loading = false;
    });
  }

  double _toDouble(dynamic value) {
    if (value == null) return 0;
    return double.tryParse(value.toString()) ?? 0;
  }

  @override
  Widget build(BuildContext context) {
    final diff = weight > 0 && targetWeight > 0 ? (weight - targetWeight) : 0;
    final progress = weight > 0 && targetWeight > 0
        ? (targetWeight / weight).clamp(0.0, 1.0)
        : 0.0;
    final goalText = diff > 0
        ? 'Lose ${diff.toStringAsFixed(1)} kg'
        : diff < 0
            ? 'Gain ${(-diff).toStringAsFixed(1)} kg'
            : 'At target weight';

    return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Weight',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  SlideInRouter(screen: const BodyCompositionScreen()),
                );
              },
              child: Card(
                color: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                  side: const BorderSide(color: Colors.grey, width: 0.2),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              SizedBox(
                                width: 50,
                                height: 50,
                                child: CircularProgressIndicator(
                                  value: loading ? 0 : progress,
                                  strokeWidth: 5,
                                  backgroundColor: Colors.grey.shade300,
                                  valueColor:
                                      const AlwaysStoppedAnimation<Color>(
                                          Color(0xFF4D6932)),
                                ),
                              ),
                              const Icon(Icons.monitor_weight,
                                  size: 24, color: Color(0xFFF07E28)),
                            ],
                          ),
                          const SizedBox(width: 20),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                loading
                                    ? 'Loading...'
                                    : '${weight.toStringAsFixed(1)} kg',
                                style: const TextStyle(
                                    fontSize: 20, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                loading ? '' : goalText,
                                style: const TextStyle(
                                    color: Colors.grey, fontSize: 10),
                              ),
                            ],
                          ),
                        ],
                      ),
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: const Color(0xFFFDEED7),
                        child: IconButton(
                          icon: const Icon(Icons.add,
                              color: Colors.white, size: 14),
                          onPressed: () {
                            Navigator.push(
                              context,
                              SlideInRouter(
                                screen: const BodyCompositionScreen(),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            )
          ],
        ));
  }
}
