import 'package:flutter/material.dart';
import 'package:good_gut/src/components/menu/edit_profile.dart';
import 'package:good_gut/src/services/user_profile_store.dart';
import 'package:good_gut/src/utils/profile_labels.dart';
import 'package:good_gut/src/components/nutritionist/know_your_nutritionist_screen.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class ViewProfileScreen extends StatefulWidget {
  const ViewProfileScreen({super.key});

  @override
  State<ViewProfileScreen> createState() => _ViewProfileScreenState();
}

class _ViewProfileScreenState extends State<ViewProfileScreen> {
  Map<String, dynamic> profile = {};
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final data = await UserProfileStore.refreshFromApi();
    if (!mounted) return;
    setState(() {
      profile = data;
      loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final complete = ProfileLabels.isComplete(profile);
    final fields = ProfileLabels.onboardingFields(profile);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFFF07E28),
        foregroundColor: Colors.white,
        title: const Text(
          'My Profile',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              await Navigator.push(
                context,
                SlideInRouter(screen: const EditProfileScreen()),
              );
              _loadProfile();
            },
          ),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadProfile,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Center(
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: const Color(0xFFFDEED7),
                          child: Text(
                            (profile['name']?.toString().isNotEmpty == true
                                    ? profile['name'].toString()[0]
                                    : '?')
                                .toUpperCase(),
                            style: const TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFF07E28),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          profile['name']?.toString() ?? 'User',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          profile['email']?.toString() ?? '',
                          style: const TextStyle(color: Colors.grey),
                        ),
                        const SizedBox(height: 8),
                        Chip(
                          label: Text(
                            complete ? 'Profile complete' : 'Complete your profile',
                          ),
                          backgroundColor: complete
                              ? const Color(0xFFE8F5E9)
                              : const Color(0xFFFDEED7),
                        ),
                      ],
                    ),
                  ),
                  if (profile['nutritionist'] is Map) ...[
                    const SizedBox(height: 16),
                    InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          SlideInRouter(
                              screen: const KnowYourNutritionistScreen()),
                        );
                      },
                      child: _sectionCard(
                        title: 'Your nutritionist',
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    profile['nutritionist']['name']
                                            ?.toString() ??
                                        'Assigned nutritionist',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  if (profile['nutritionist']['specialty'] !=
                                      null)
                                    Text(
                                      profile['nutritionist']['specialty']
                                          .toString(),
                                      style:
                                          const TextStyle(color: Colors.grey),
                                    ),
                                  const SizedBox(height: 4),
                                  const Text(
                                    'Tap for full profile',
                                    style: TextStyle(
                                      color: Color(0xFFF07E28),
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(Icons.arrow_forward_ios,
                                size: 16, color: Colors.grey),
                          ],
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  _sectionCard(
                    title: 'Health profile (9 steps)',
                    child: Column(
                      children: fields
                          .map(
                            (field) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    flex: 2,
                                    child: Text(
                                      field.label,
                                      style: const TextStyle(
                                        color: Colors.grey,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                  Expanded(
                                    flex: 3,
                                    child: Text(
                                      field.value,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                          .toList(),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _sectionCard({required String title, required Widget child}) {
    return Card(
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Colors.grey, width: 0.2),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}
