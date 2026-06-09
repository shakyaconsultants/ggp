import 'package:flutter/material.dart';
import 'package:good_gut/src/components/chat_screen/chat_page.dart';
import 'package:good_gut/src/components/nutritionist/know_your_nutritionist_screen.dart';
import 'package:good_gut/src/services/client_api_service.dart';
import 'package:good_gut/src/services/user_profile_store.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class NutritionistCard extends StatefulWidget {
  const NutritionistCard({super.key});

  @override
  State<NutritionistCard> createState() => _NutritionistCardState();
}

class _NutritionistCardState extends State<NutritionistCard> {
  Map<String, dynamic>? nutritionist;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    Map<String, dynamic>? data = await ClientApiService.fetchNutritionist();

    if (data == null) {
      final profile = await UserProfileStore.loadCached();
      if (profile['nutritionist'] is Map) {
        data = Map<String, dynamic>.from(profile['nutritionist'] as Map);
      }
    }

    if (!mounted) return;
    setState(() {
      nutritionist = data;
      loading = false;
    });
  }

  void _openProfile() {
    Navigator.push(
      context,
      SlideInRouter(screen: const KnowYourNutritionistScreen()),
    );
  }

  void _openChat() {
    if (nutritionist == null) return;
    final name = nutritionist!['name']?.toString().trim().isNotEmpty == true
        ? nutritionist!['name'].toString()
        : '${nutritionist!['first_name'] ?? ''} ${nutritionist!['last_name'] ?? ''}'
            .trim();
    final specialty = nutritionist!['specialty']?.toString() ?? '';
    Navigator.push(
      context,
      SlideInRouter(
        screen: ChatPage(
          nutritionistName: name.isNotEmpty ? name : 'Your nutritionist',
          nutritionistSpecialty: specialty,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16),
        child: LinearProgressIndicator(
          color: Color(0xFFF07E28),
          backgroundColor: Color(0xFFFDEED7),
        ),
      );
    }

    if (nutritionist == null) {
      return const SizedBox.shrink();
    }

    final name = nutritionist!['name']?.toString().trim().isNotEmpty == true
        ? nutritionist!['name'].toString()
        : '${nutritionist!['first_name'] ?? ''} ${nutritionist!['last_name'] ?? ''}'
            .trim();
    final specialty = nutritionist!['specialty']?.toString() ?? '';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Colors.grey, width: 0.2),
        ),
        child: InkWell(
          onTap: _openProfile,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: const Color(0xFFFDEED7),
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : 'N',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFF07E28),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Know your nutritionist',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        name.isNotEmpty ? name : 'Your nutritionist',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (specialty.isNotEmpty)
                        Text(
                          specialty,
                          style: const TextStyle(
                            fontSize: 13,
                            color: Colors.grey,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios, size: 18, color: Colors.grey),
                const SizedBox(width: 4),
                IconButton(
                  tooltip: 'Message nutritionist',
                  onPressed: _openChat,
                  icon: const Icon(Icons.message, color: Color(0xFFF07E28)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
