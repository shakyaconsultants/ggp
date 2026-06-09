class ProfileField {
  final String label;
  final String value;

  const ProfileField({required this.label, required this.value});
}

class ProfileLabels {
  static String display(dynamic value, {String empty = 'Not set'}) {
    if (value == null) return empty;
    final text = value.toString().trim();
    return text.isEmpty ? empty : text;
  }

  static String formatDate(dynamic value) {
    if (value == null) return 'Not set';
    final text = value.toString();
    if (text.length >= 10) return text.substring(0, 10);
    return text;
  }

  static bool isComplete(Map<String, dynamic> profile) {
    if (profile['onboarded'] == 1 || profile['onboarded'] == true) {
      return true;
    }
    return profile['gender'] != null &&
        profile['dob'] != null &&
        profile['height'] != null &&
        profile['weight'] != null &&
        profile['goal'] != null;
  }

  static List<ProfileField> onboardingFields(Map<String, dynamic> profile) {
    return [
      ProfileField(label: 'Gender', value: display(profile['gender'])),
      ProfileField(label: 'Date of birth', value: formatDate(profile['dob'])),
      ProfileField(
        label: 'Height',
        value: profile['height'] != null ? '${profile['height']} cm' : 'Not set',
      ),
      ProfileField(
        label: 'Current weight',
        value: profile['weight'] != null ? '${profile['weight']} kg' : 'Not set',
      ),
      ProfileField(
        label: 'Target weight',
        value: profile['targetWeight'] != null
            ? '${profile['targetWeight']} kg'
            : 'Not set',
      ),
      ProfileField(
        label: 'Body fat',
        value: profile['bodyfat'] != null ? '${profile['bodyfat']}%' : 'Not set',
      ),
      ProfileField(label: 'Medical conditions', value: display(profile['medical'])),
      ProfileField(label: 'Workout frequency', value: display(profile['workout'])),
      ProfileField(label: 'Food preference', value: display(profile['food'])),
      ProfileField(label: 'Occupation', value: display(profile['occupation'])),
      ProfileField(label: 'Health goal', value: display(profile['goal'])),
    ];
  }
}
