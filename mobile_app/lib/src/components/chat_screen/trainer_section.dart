import 'package:flutter/material.dart';
import 'package:good_gut/src/components/chat_screen/chat_page.dart';
import 'package:good_gut/src/services/client_api_service.dart';
import 'package:good_gut/src/services/user_profile_store.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class TrainerSection extends StatefulWidget {
  const TrainerSection({super.key});

  @override
  State<TrainerSection> createState() => _TrainerSectionState();
}

class _TrainerSectionState extends State<TrainerSection> {
  Map<String, dynamic>? nutritionist;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadNutritionist();
  }

  Future<void> _loadNutritionist() async {
    final profile = await UserProfileStore.loadCached();
    Map<String, dynamic>? assigned;

    if (profile['nutritionist'] is Map) {
      assigned = Map<String, dynamic>.from(profile['nutritionist'] as Map);
    } else {
      assigned = await ClientApiService.fetchNutritionist();
    }

    if (!mounted) return;
    setState(() {
      nutritionist = assigned;
      loading = false;
    });
  }

  void _openChat() {
    if (nutritionist == null) return;
    final name = nutritionist!['name']?.toString() ?? 'Your nutritionist';
    final specialty = nutritionist!['specialty']?.toString() ?? '';
    Navigator.push(
      context,
      SlideInRouter(
        screen: ChatPage(
          nutritionistName: name,
          nutritionistSpecialty: specialty,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (nutritionist == null) {
      return const Padding(
        padding: EdgeInsets.all(24),
        child: Text(
          'No nutritionist assigned yet. Ask your clinic to link your account.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey),
        ),
      );
    }

    final name = nutritionist!['name']?.toString() ?? 'Your nutritionist';
    final specialty = nutritionist!['specialty']?.toString() ?? '';

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Message your nutritionist',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Chat here syncs with the Good Gut portal — messages you send appear for your nutritionist instantly.',
            style: TextStyle(color: Colors.grey, fontSize: 13),
          ),
          const SizedBox(height: 16),
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.grey.shade300),
            ),
            child: InkWell(
              onTap: _openChat,
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
                          color: Color(0xFFF07E28),
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
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
                            ),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: Colors.grey),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _openChat,
            icon: const Icon(Icons.message_outlined),
            label: const Text('Open chat'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF07E28),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
