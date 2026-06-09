import 'package:flutter/material.dart';
import 'package:good_gut/src/services/client_api_service.dart';
import 'package:good_gut/src/services/user_profile_store.dart';

class KnowYourNutritionistScreen extends StatefulWidget {
  const KnowYourNutritionistScreen({super.key});

  @override
  State<KnowYourNutritionistScreen> createState() =>
      _KnowYourNutritionistScreenState();
}

class _KnowYourNutritionistScreenState
    extends State<KnowYourNutritionistScreen> {
  Map<String, dynamic>? nutritionist;
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      loading = true;
      error = null;
    });

    Map<String, dynamic>? data = await ClientApiService.fetchNutritionist();

    if (data == null) {
      final profile = await UserProfileStore.refreshFromApi();
      if (profile['nutritionist'] is Map) {
        data = Map<String, dynamic>.from(profile['nutritionist'] as Map);
      }
    }

    if (!mounted) return;
    setState(() {
      nutritionist = data;
      loading = false;
      if (data == null) {
        error =
            'No nutritionist assigned yet. Ask your clinic to link your account.';
      }
    });
  }

  String _text(String key) => nutritionist?[key]?.toString().trim() ?? '';

  String _display(String key) {
    final value = _text(key);
    return value.isEmpty ? '—' : value;
  }

  @override
  Widget build(BuildContext context) {
    final name = _text('name').isNotEmpty
        ? _text('name')
        : '${_text('first_name')} ${_text('last_name')}'.trim();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFFF07E28),
        foregroundColor: Colors.white,
        title: const Text(
          'Know your nutritionist',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(
                      error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.grey),
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      Card(
                        color: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: Colors.grey, width: 0.2),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            children: [
                              CircleAvatar(
                                radius: 44,
                                backgroundColor: const Color(0xFFFDEED7),
                                child: Text(
                                  name.isNotEmpty
                                      ? name[0].toUpperCase()
                                      : 'N',
                                  style: const TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFFF07E28),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                name.isNotEmpty ? name : 'Your nutritionist',
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              if (_text('specialty').isNotEmpty) ...[
                                const SizedBox(height: 6),
                                Text(
                                  _text('specialty'),
                                  style: const TextStyle(
                                    color: Colors.grey,
                                    fontSize: 15,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFDEED7),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: const Text(
                                  'Your assigned care provider',
                                  style: TextStyle(
                                    color: Color(0xFFF07E28),
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      _detailsCard(
                        title: 'Professional details',
                        rows: [
                          _DetailRow(
                            icon: Icons.work_outline,
                            label: 'Specialty',
                            value: _display('specialty'),
                          ),
                          _DetailRow(
                            icon: Icons.timeline_outlined,
                            label: 'Experience',
                            value: nutritionist?['years_of_experience'] != null
                                ? '${nutritionist!['years_of_experience']} years'
                                : '—',
                          ),
                          _DetailRow(
                            icon: Icons.business_outlined,
                            label: 'Organisation',
                            value: _display('current_organisation'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _detailsCard(
                        title: 'Contact',
                        rows: [
                          _DetailRow(
                            icon: Icons.email_outlined,
                            label: 'Email',
                            value: _display('email'),
                          ),
                          _DetailRow(
                            icon: Icons.phone_outlined,
                            label: 'Phone',
                            value: _display('phone_number'),
                          ),
                          _DetailRow(
                            icon: Icons.location_on_outlined,
                            label: 'Address',
                            value: _display('address'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'This is the nutritionist who created your account and manages your diet plans, exercises, and appointments.',
                        style: TextStyle(color: Colors.grey, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _detailsCard({
    required String title,
    required List<_DetailRow> rows,
  }) {
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
            ...rows.map(
              (row) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(row.icon, size: 20, color: const Color(0xFFF07E28)),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: Text(
                        row.label,
                        style: const TextStyle(color: Colors.grey, fontSize: 14),
                      ),
                    ),
                    Expanded(
                      flex: 3,
                      child: Text(
                        row.value,
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow {
  final IconData icon;
  final String label;
  final String value;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });
}
