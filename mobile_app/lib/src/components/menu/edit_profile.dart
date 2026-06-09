import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/services/client_api_service.dart';
import 'package:good_gut/src/services/user_profile_store.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  bool loading = true;
  bool saving = false;

  late TextEditingController nameController;
  late TextEditingController heightController;
  late TextEditingController weightController;
  late TextEditingController targetWeightController;
  late TextEditingController dobController;
  late TextEditingController bodyfatController;
  late TextEditingController medicalController;
  late TextEditingController occupationController;
  late TextEditingController goalController;

  String gender = AppStrings.femaleLabel;
  String foodPreference = AppStrings.food[1] as String;
  String workoutFrequency = AppStrings.duration[1] as String;

  @override
  void initState() {
    super.initState();
    nameController = TextEditingController();
    heightController = TextEditingController();
    weightController = TextEditingController();
    targetWeightController = TextEditingController();
    dobController = TextEditingController();
    bodyfatController = TextEditingController();
    medicalController = TextEditingController();
    occupationController = TextEditingController();
    goalController = TextEditingController();
    _loadProfile();
  }

  @override
  void dispose() {
    nameController.dispose();
    heightController.dispose();
    weightController.dispose();
    targetWeightController.dispose();
    dobController.dispose();
    bodyfatController.dispose();
    medicalController.dispose();
    occupationController.dispose();
    goalController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    final profile = await UserProfileStore.refreshFromApi();
    if (!mounted) return;
    setState(() {
      nameController.text = profile['name']?.toString() ?? '';
      gender = profile['gender']?.toString() ?? AppStrings.femaleLabel;
      heightController.text = profile['height']?.toString() ?? '';
      weightController.text = profile['weight']?.toString() ?? '';
      targetWeightController.text = profile['targetWeight']?.toString() ?? '';
      dobController.text = profile['dob']?.toString() ?? '';
      bodyfatController.text = profile['bodyfat']?.toString() ?? '';
      medicalController.text = profile['medical']?.toString() ?? '';
      occupationController.text = profile['occupation']?.toString() ?? '';
      goalController.text = profile['goal']?.toString() ?? '';
      foodPreference =
          profile['food']?.toString() ?? AppStrings.food[1] as String;
      workoutFrequency =
          profile['workout']?.toString() ?? AppStrings.duration[1] as String;
      loading = false;
    });
  }

  Future<void> _saveProfile() async {
    setState(() => saving = true);
    final ok = await ClientApiService.updateUserData({
      'gender': gender,
      'height': heightController.text,
      'weight': weightController.text,
      'targetWeight': targetWeightController.text,
      'dob': dobController.text,
      'bodyfat': bodyfatController.text,
      'medical': medicalController.text,
      'occupation': occupationController.text,
      'goal': goalController.text,
      'food': foodPreference,
      'workout': workoutFrequency,
    });

    if (ok) {
      await UserProfileStore.refreshFromApi();
    }

    if (!mounted) return;
    setState(() => saving = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(ok ? 'Profile updated' : 'Could not update profile'),
      ),
    );
    if (ok) Navigator.pop(context);
  }

  List<String> get _genderOptions =>
      [AppStrings.femaleLabel, AppStrings.maleLabel];

  List<String> get _foodOptions =>
      AppStrings.food.values.map((e) => e.toString()).toList();

  List<String> get _workoutOptions =>
      AppStrings.duration.values.map((e) => e.toString()).toList();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFFF07E28),
        title: const Text(
          'Edit Profile',
          style: TextStyle(
              fontSize: 20, color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: saving
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.done, color: Colors.white),
            onPressed: saving ? null : _saveProfile,
          ),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Card(
                color: Colors.white,
                margin: const EdgeInsets.symmetric(horizontal: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        buildSectionTitle('Personal'),
                        buildControllerField('Name', nameController,
                            readOnly: true),
                        buildDropdownField('Gender', gender, _genderOptions,
                            (value) {
                          setState(() => gender = value);
                        }),
                        buildControllerField('Date of Birth', dobController),
                        buildControllerField('Height (cm)', heightController),
                        buildControllerField('Weight (kg)', weightController),
                        buildControllerField(
                            'Target Weight (kg)', targetWeightController),
                        buildControllerField(
                            'Body Fat %', bodyfatController),
                        buildSectionTitle('Health & lifestyle'),
                        buildControllerField(
                            'Medical conditions', medicalController,
                            maxLines: 3),
                        buildDropdownField(
                            'Workout frequency',
                            workoutFrequency,
                            _workoutOptions, (value) {
                          setState(() => workoutFrequency = value);
                        }),
                        buildDropdownField(
                            'Food preference', foodPreference, _foodOptions,
                            (value) {
                          setState(() => foodPreference = value);
                        }),
                        buildControllerField('Occupation', occupationController),
                        buildControllerField('Health goal', goalController),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ),
            ),
    );
  }

  Widget buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(
        title,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget buildControllerField(String label, TextEditingController controller,
      {bool readOnly = false, int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextFormField(
        controller: controller,
        readOnly: readOnly,
        maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label,
        ),
      ),
    );
  }

  Widget buildDropdownField(String label, String selectedValue,
      List<String> options, ValueChanged<String> onChanged) {
    final value = options.contains(selectedValue)
        ? selectedValue
        : (options.isNotEmpty ? options.first : selectedValue);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
        ),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            isExpanded: true,
            value: value,
            items: options.map((String option) {
              return DropdownMenuItem<String>(
                value: option,
                child: Text(option),
              );
            }).toList(),
            onChanged: (option) {
              if (option != null) onChanged(option);
            },
          ),
        ),
      ),
    );
  }
}
